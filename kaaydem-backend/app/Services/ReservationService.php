<?php

namespace App\Services;

use App\Enums\ReservationStatus;
use App\Enums\TransactionType;
use App\Enums\TripStatus;
use App\Exceptions\ChevauchementReservationException;
use App\Exceptions\PlacesInsuffisantesException;
use App\Exceptions\SoldeInsuffisantException;
use App\Exceptions\TransitionInvalideException;
use App\Mail\ReservationConfirmeeMail;
use App\Mail\ReservationRefuseeMail;
use App\Models\Reservation;
use App\Models\ReservationStatusHistory;
use App\Models\Transaction;
use App\Models\Trip;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;

class ReservationService
{
    /**
     * Fenêtre de chevauchement : deux trajets sont considérés en conflit
     * si leurs heures de départ sont à moins de 2h l'une de l'autre.
     * (hypothèse à documenter dans le rapport, faute de durée de trajet
     * explicite dans le modèle de données)
     */
    private const HEURES_FENETRE_CHEVAUCHEMENT = 2;

    /**
     * EF-05 : créer une réservation (en attente), places retenues
     * immédiatement. Exigence bonus (paiement simulé) : le montant total
     * est débité du portefeuille virtuel du passager dès la demande,
     * exactement comme les places sont retenues dès la demande — et
     * restitué si la demande est refusée ou annulée avant confirmation
     * par le conducteur.
     */
    public function reserver(Trip $trajet, User $passager, int $nombrePlaces): Reservation
    {
        if ($trajet->driver_id === $passager->id) {
            throw new TransitionInvalideException('Vous ne pouvez pas réserver votre propre trajet.');
        }

        if ($trajet->statut !== TripStatus::Publie) {
            throw new TransitionInvalideException('Ce trajet n\'est plus ouvert aux réservations.');
        }

        if ($trajet->places_disponibles < $nombrePlaces) {
            throw new PlacesInsuffisantesException;
        }

        // Un passager ne peut pas avoir deux réservations ACTIVES sur le
        // même trajet en même temps — mais peut retenter après un refus
        // ou une annulation (contrairement à l'ancienne contrainte SQL
        // unique(trip_id, passenger_id), qui bloquait indéfiniment).
        $dejaActive = Reservation::where('trip_id', $trajet->id)
            ->where('passenger_id', $passager->id)
            ->whereIn('statut', [ReservationStatus::EnAttente, ReservationStatus::Confirmee])
            ->exists();

        if ($dejaActive) {
            throw new TransitionInvalideException('Vous avez déjà une réservation active sur ce trajet.');
        }

        $cout = $nombrePlaces * $trajet->prix_par_place;

        if ($passager->solde < $cout) {
            throw new SoldeInsuffisantException;
        }

        $this->verifierAbsenceDeChevauchement($passager, $trajet);

        return DB::transaction(function () use ($trajet, $passager, $nombrePlaces, $cout) {
            $reservation = Reservation::create([
                'trip_id' => $trajet->id,
                'passenger_id' => $passager->id,
                'nombre_places' => $nombrePlaces,
                'statut' => ReservationStatus::EnAttente,
            ]);

            // On retient les places dès la demande (évite qu'un trajet à
            // 1 place restante accepte 5 demandes "en attente" en parallèle)
            $trajet->decrement('places_disponibles', $nombrePlaces);
            if ($trajet->places_disponibles === 0) {
                $trajet->update(['statut' => TripStatus::Complet]);
            }

            $this->debiterPortefeuille(
                $passager,
                $cout,
                "Réservation #{$reservation->id} : {$trajet->ville_depart} → {$trajet->ville_arrivee}",
                $reservation
            );

            $this->enregistrerTransition($reservation, ReservationStatus::EnAttente, $passager);

            return $reservation;
        });
    }

    /** EF-06 : le conducteur accepte la demande */
    public function confirmer(Reservation $reservation, User $conducteur): Reservation
    {
        $this->verifierEstLeConducteur($reservation, $conducteur);

        if ($reservation->statut !== ReservationStatus::EnAttente) {
            throw new TransitionInvalideException('Seule une réservation en attente peut être confirmée.');
        }

        $reservation->update(['statut' => ReservationStatus::Confirmee]);
        $this->enregistrerTransition($reservation, ReservationStatus::Confirmee, $conducteur);

        // Exigence bonus : notification par e-mail, envoyée via la file
        // d'attente (n'attend pas la réponse SMTP dans la requête HTTP)
        Mail::to($reservation->passenger)->queue(new ReservationConfirmeeMail($reservation));

        return $reservation;
    }

    /** EF-06 : le conducteur refuse la demande (les places ET l'argent sont restitués) */
    public function refuser(Reservation $reservation, User $conducteur): Reservation
    {
        $this->verifierEstLeConducteur($reservation, $conducteur);

        if ($reservation->statut !== ReservationStatus::EnAttente) {
            throw new TransitionInvalideException('Seule une réservation en attente peut être refusée.');
        }

        return DB::transaction(function () use ($reservation, $conducteur) {
            $reservation->update(['statut' => ReservationStatus::Refusee]);
            $this->restituerLesPlaces($reservation);
            $this->rembourserPassager($reservation, 'Remboursement — réservation refusée par le conducteur');
            $this->enregistrerTransition($reservation, ReservationStatus::Refusee, $conducteur);

            Mail::to($reservation->passenger)->queue(new ReservationRefuseeMail($reservation));

            return $reservation;
        });
    }

    /** Le passager annule sa propre réservation (en attente ou confirmée) */
    public function annulerParPassager(Reservation $reservation, User $passager): Reservation
    {
        if ($reservation->passenger_id !== $passager->id) {
            throw new TransitionInvalideException('Vous ne pouvez annuler que vos propres réservations.');
        }

        if (! in_array($reservation->statut, [ReservationStatus::EnAttente, ReservationStatus::Confirmee], true)) {
            throw new TransitionInvalideException('Cette réservation ne peut plus être annulée.');
        }

        return DB::transaction(function () use ($reservation, $passager) {
            $reservation->update(['statut' => ReservationStatus::Annulee]);
            $this->restituerLesPlaces($reservation);
            $this->rembourserPassager($reservation, 'Remboursement — réservation annulée par le passager');
            $this->enregistrerTransition($reservation, ReservationStatus::Annulee, $passager);

            return $reservation;
        });
    }

    /**
     * Appelé par TripController::close() : quand le conducteur clôture le
     * trajet, toutes les réservations confirmées passent à "terminée"
     * (prérequis pour pouvoir laisser un avis, EF-07). C'est à ce moment
     * précis que le conducteur est payé (paiement simulé) : le passager
     * a été débité dès sa demande, mais le conducteur ne touche l'argent
     * qu'une fois le trajet effectivement réalisé.
     */
    public function terminerReservationsConfirmees(Trip $trajet, User $conducteur): void
    {
        $trajet->reservations()
            ->where('statut', ReservationStatus::Confirmee)
            ->get()
            ->each(function (Reservation $reservation) use ($conducteur, $trajet) {
                $reservation->update(['statut' => ReservationStatus::Terminee]);
                $this->enregistrerTransition($reservation, ReservationStatus::Terminee, $conducteur);

                $cout = $reservation->nombre_places * $trajet->prix_par_place;
                $this->crediterPortefeuille(
                    $conducteur,
                    $cout,
                    "Paiement reçu — réservation #{$reservation->id} : {$trajet->ville_depart} → {$trajet->ville_arrivee}",
                    $reservation
                );
            });
    }

    // --- Méthodes privées internes ---

    private function verifierEstLeConducteur(Reservation $reservation, User $conducteur): void
    {
        if ($reservation->trip->driver_id !== $conducteur->id) {
            throw new TransitionInvalideException('Seul le conducteur du trajet peut effectuer cette action.');
        }
    }

    private function restituerLesPlaces(Reservation $reservation): void
    {
        $trajet = $reservation->trip;
        $trajet->increment('places_disponibles', $reservation->nombre_places);

        // Si le trajet était marqué "complet", il redevient ouvert
        if ($trajet->statut === TripStatus::Complet && $trajet->places_disponibles > 0) {
            $trajet->update(['statut' => TripStatus::Publie]);
        }
    }

    private function enregistrerTransition(Reservation $reservation, ReservationStatus $statut, User $acteur): void
    {
        ReservationStatusHistory::create([
            'reservation_id' => $reservation->id,
            'statut' => $statut,
            'acteur_id' => $acteur->id,
            'created_at' => now(),
        ]);
    }

    private function verifierAbsenceDeChevauchement(User $passager, Trip $nouveauTrajet): void
    {
        $debut = $nouveauTrajet->date_heure_depart->copy()->subHours(self::HEURES_FENETRE_CHEVAUCHEMENT);
        $fin = $nouveauTrajet->date_heure_depart->copy()->addHours(self::HEURES_FENETRE_CHEVAUCHEMENT);

        $chevauchement = Reservation::where('passenger_id', $passager->id)
            ->whereIn('statut', [ReservationStatus::EnAttente, ReservationStatus::Confirmee])
            ->whereHas('trip', function ($query) use ($debut, $fin) {
                $query->whereBetween('date_heure_depart', [$debut, $fin]);
            })
            ->exists();

        if ($chevauchement) {
            throw new ChevauchementReservationException;
        }
    }

    // --- Portefeuille virtuel (exigence bonus : paiement simulé) ---

    private function debiterPortefeuille(User $utilisateur, float $montant, string $description, Reservation $reservation): void
    {
        $utilisateur->decrement('solde', $montant);
        Transaction::create([
            'user_id' => $utilisateur->id,
            'reservation_id' => $reservation->id,
            'type' => TransactionType::Debit,
            'montant' => $montant,
            'description' => $description,
        ]);
    }

    private function crediterPortefeuille(User $utilisateur, float $montant, string $description, Reservation $reservation): void
    {
        $utilisateur->increment('solde', $montant);
        Transaction::create([
            'user_id' => $utilisateur->id,
            'reservation_id' => $reservation->id,
            'type' => TransactionType::Credit,
            'montant' => $montant,
            'description' => $description,
        ]);
    }

    private function rembourserPassager(Reservation $reservation, string $description): void
    {
        $cout = $reservation->nombre_places * $reservation->trip->prix_par_place;
        $this->crediterPortefeuille($reservation->passenger, $cout, $description, $reservation);
    }
}

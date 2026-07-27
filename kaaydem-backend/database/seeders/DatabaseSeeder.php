<?php

namespace Database\Seeders;

use App\Enums\DriverValidationStatus;
use App\Enums\ReservationStatus;
use App\Enums\TripStatus;
use App\Models\DriverProfile;
use App\Models\Reservation;
use App\Models\ReservationStatusHistory;
use App\Models\Review;
use App\Models\Trip;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Un compte admin fixe, facile à retenir pour la démo/soutenance
        $admin = User::factory()->admin()->create([
            'name' => 'Admin Kaay Dem',
            'email' => 'admin@kaaydem.sn',
        ]);

        // 2. Des conducteurs : certains déjà validés, un en attente, un rejeté
        //    (pour montrer les 3 états de EF-02 lors de la démo admin)
        $conducteursValides = User::factory(5)->create();
        foreach ($conducteursValides as $conducteur) {
            DriverProfile::factory()->valide()->create(['user_id' => $conducteur->id]);
        }

        $conducteurEnAttente = User::factory()->create();
        DriverProfile::factory()->create(['user_id' => $conducteurEnAttente->id]); // statut par défaut = en_attente

        $conducteurRejete = User::factory()->create();
        DriverProfile::factory()->rejete()->create(['user_id' => $conducteurRejete->id]);

        // 3. Des passagers simples (utilisateurs sans profil conducteur)
        $passagers = User::factory(15)->create();

        // 4. Des trajets publiés par les conducteurs validés uniquement
        //    (un conducteur non validé ne devrait pas pouvoir publier, donc
        //    on ne génère pas de trajet pour lui ici)
        $trips = collect();
        foreach ($conducteursValides as $conducteur) {
            $trips = $trips->merge(
                Trip::factory(3)->create(['driver_id' => $conducteur->id])
            );
        }

        // 5. Quelques trajets déjà terminés (pour pouvoir générer des avis dessus)
        $tripsTermines = collect();
        foreach ($conducteursValides->take(3) as $conducteur) {
            $tripsTermines->push(
                Trip::factory()->termine()->create(['driver_id' => $conducteur->id])
            );
        }

        // 6. Réservations sur les trajets "en cours" (statuts variés + historique)
        foreach ($trips->take(10) as $trip) {
            $nbReservations = fake()->numberBetween(0, 2);

            for ($i = 0; $i < $nbReservations; $i++) {
                $passager = $passagers->random();
                $statut = fake()->randomElement([
                    ReservationStatus::EnAttente,
                    ReservationStatus::Confirmee,
                    ReservationStatus::Refusee,
                ]);

                $reservation = Reservation::factory()->create([
                    'trip_id' => $trip->id,
                    'passenger_id' => $passager->id,
                    'nombre_places' => 1,
                    'statut' => $statut,
                ]);

                // Historique : au moins la création, puis la transition si applicable
                ReservationStatusHistory::factory()->create([
                    'reservation_id' => $reservation->id,
                    'statut' => ReservationStatus::EnAttente,
                    'acteur_id' => $passager->id,
                    'created_at' => now()->subDays(2),
                ]);

                if ($statut !== ReservationStatus::EnAttente) {
                    ReservationStatusHistory::factory()->create([
                        'reservation_id' => $reservation->id,
                        'statut' => $statut,
                        'acteur_id' => $trip->driver_id, // le conducteur décide
                        'created_at' => now()->subDay(),
                    ]);

                    // Si confirmée, on décrémente les places disponibles (EF-05)
                    if ($statut === ReservationStatus::Confirmee) {
                        $trip->decrement('places_disponibles', $reservation->nombre_places);
                    }
                }
            }
        }

        // 7. Réservations terminées + avis sur les trajets clôturés (EF-07)
        foreach ($tripsTermines as $trip) {
            $passager = $passagers->random();

            $reservation = Reservation::factory()->terminee()->create([
                'trip_id' => $trip->id,
                'passenger_id' => $passager->id,
                'nombre_places' => 1,
            ]);

            ReservationStatusHistory::factory()->create([
                'reservation_id' => $reservation->id,
                'statut' => ReservationStatus::EnAttente,
                'acteur_id' => $passager->id,
                'created_at' => now()->subWeek(),
            ]);
            ReservationStatusHistory::factory()->create([
                'reservation_id' => $reservation->id,
                'statut' => ReservationStatus::Confirmee,
                'acteur_id' => $trip->driver_id,
                'created_at' => now()->subDays(6),
            ]);
            ReservationStatusHistory::factory()->create([
                'reservation_id' => $reservation->id,
                'statut' => ReservationStatus::Terminee,
                'acteur_id' => $trip->driver_id,
                'created_at' => now()->subDays(5),
            ]);

            Review::factory()->create(['reservation_id' => $reservation->id]);
        }

        $this->command->info('Base de démonstration créée : '.
            User::count().' utilisateurs, '.
            Trip::count().' trajets, '.
            Reservation::count().' réservations, '.
            Review::count().' avis.'
        );
        $this->command->info('Connexion admin : admin@kaaydem.sn / password');
    }
}

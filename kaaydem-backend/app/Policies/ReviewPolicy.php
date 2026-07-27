<?php

namespace App\Policies;

use App\Enums\ReservationStatus;
use App\Models\Reservation;
use App\Models\User;

class ReviewPolicy
{
    /**
     * Seul le passager de la réservation peut noter, et seulement si le
     * trajet est bien terminé (EF-07). L'unicité (un seul avis par
     * réservation) est vérifiée séparément dans le contrôleur, car elle
     * lève une exception métier dédiée plutôt qu'un simple refus 403.
     */
    public function create(User $user, Reservation $reservation): bool
    {
        return $user->id === $reservation->passenger_id
            && $reservation->statut === ReservationStatus::Terminee;
    }
}

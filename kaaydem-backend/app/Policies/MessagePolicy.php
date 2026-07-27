<?php

namespace App\Policies;

use App\Enums\ReservationStatus;
use App\Models\Reservation;
use App\Models\User;

class MessagePolicy
{
    /**
     * La messagerie n'a de sens qu'une fois la réservation confirmée
     * (avant, les deux parties n'ont pas encore d'engagement mutuel) —
     * on autorise aussi après clôture (terminee) pour laisser un dernier
     * échange possible (ex : objet oublié dans le véhicule).
     */
    public function participer(User $user, Reservation $reservation): bool
    {
        $participant = $user->id === $reservation->passenger_id
            || $user->id === $reservation->trip->driver_id;

        $reservationEngagee = in_array($reservation->statut, [
            ReservationStatus::Confirmee,
            ReservationStatus::Terminee,
        ], true);

        return $participant && $reservationEngagee;
    }
}

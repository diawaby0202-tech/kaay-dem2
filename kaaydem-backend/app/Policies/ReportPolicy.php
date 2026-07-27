<?php

namespace App\Policies;

use App\Enums\ReservationStatus;
use App\Models\Reservation;
use App\Models\User;

class ReportPolicy
{
    /**
     * On ne peut signaler que l'autre partie d'une réservation à laquelle
     * on a réellement participé (le passager ou le conducteur du trajet),
     * et seulement une fois que la réservation a été confirmée — pas la
     * peine de permettre un signalement sur une simple demande en attente
     * ou refusée, puisqu'il n'y a alors pas eu de trajet effectif.
     */
    public function create(User $user, Reservation $reservation): bool
    {
        $participant = $user->id === $reservation->passenger_id
            || $user->id === $reservation->trip->driver_id;

        $reservationEffective = in_array($reservation->statut, [
            ReservationStatus::Confirmee,
            ReservationStatus::Terminee,
        ], true);

        return $participant && $reservationEffective;
    }
}

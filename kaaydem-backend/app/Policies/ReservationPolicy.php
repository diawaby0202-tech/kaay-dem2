<?php

namespace App\Policies;

use App\Models\Reservation;
use App\Models\User;

class ReservationPolicy
{
    /** Le passager concerné, le conducteur du trajet, ou un admin peuvent voir le détail */
    public function view(User $user, Reservation $reservation): bool
    {
        return $user->id === $reservation->passenger_id
            || $user->id === $reservation->trip->driver_id
            || $user->is_admin;
    }

    /** Accepter/refuser : seul le conducteur du trajet concerné */
    public function gererParConducteur(User $user, Reservation $reservation): bool
    {
        return $user->id === $reservation->trip->driver_id;
    }

    /** Annuler : seul le passager qui a fait la réservation */
    public function annulerParPassager(User $user, Reservation $reservation): bool
    {
        return $user->id === $reservation->passenger_id;
    }
}

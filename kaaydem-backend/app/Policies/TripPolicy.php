<?php

namespace App\Policies;

use App\Models\Trip;
use App\Models\User;

class TripPolicy
{
    /** Seul un conducteur VALIDÉ (permis + véhicule acceptés par l'admin) peut publier */
    public function create(User $user): bool
    {
        return $user->estConducteurValide();
    }

    /**
     * Seul l'auteur du trajet peut le modifier, ET seulement s'il n'a
     * aucune réservation confirmée dessus (EF-03).
     */
    public function update(User $user, Trip $trip): bool
    {
        return $user->id === $trip->driver_id && $trip->estModifiable();
    }

    /** Même règle que la modification pour l'annulation */
    public function delete(User $user, Trip $trip): bool
    {
        return $user->id === $trip->driver_id && $trip->estModifiable();
    }

    /**
     * Clôturer un trajet : contrairement à update()/delete(), on autorise
     * même s'il y a des réservations confirmées (c'est même le cas normal :
     * on clôture APRÈS avoir transporté des passagers confirmés).
     */
    public function close(User $user, Trip $trip): bool
    {
        return $user->id === $trip->driver_id;
    }
}

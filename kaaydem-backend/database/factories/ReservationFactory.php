<?php

namespace Database\Factories;

use App\Enums\ReservationStatus;
use App\Models\Trip;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class ReservationFactory extends Factory
{
    protected $model = \App\Models\Reservation::class;

    public function definition(): array
    {
        return [
            'trip_id' => Trip::factory(),
            'passenger_id' => User::factory(),
            'nombre_places' => fake()->numberBetween(1, 2),
            'statut' => ReservationStatus::EnAttente,
        ];
    }

    /** État : le conducteur a accepté la demande */
    public function confirmee(): static
    {
        return $this->state(fn () => ['statut' => ReservationStatus::Confirmee]);
    }

    /** État : le trajet est terminé, réservation clôturée avec succès (EF-07) */
    public function terminee(): static
    {
        return $this->state(fn () => ['statut' => ReservationStatus::Terminee]);
    }

    /** État : annulée par le passager */
    public function annulee(): static
    {
        return $this->state(fn () => ['statut' => ReservationStatus::Annulee]);
    }

    /** État : refusée par le conducteur */
    public function refusee(): static
    {
        return $this->state(fn () => ['statut' => ReservationStatus::Refusee]);
    }
}

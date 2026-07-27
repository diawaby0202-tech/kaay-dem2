<?php

namespace Database\Factories;

use App\Enums\ReservationStatus;
use App\Models\Reservation;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class ReservationStatusHistoryFactory extends Factory
{
    protected $model = \App\Models\ReservationStatusHistory::class;

    public function definition(): array
    {
        return [
            'reservation_id' => Reservation::factory(),
            'statut' => ReservationStatus::EnAttente,
            'acteur_id' => User::factory(),
            'created_at' => now(),
        ];
    }
}

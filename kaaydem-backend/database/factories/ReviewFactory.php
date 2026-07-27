<?php

namespace Database\Factories;

use App\Models\Reservation;
use Illuminate\Database\Eloquent\Factories\Factory;

class ReviewFactory extends Factory
{
    protected $model = \App\Models\Review::class;

    // Commentaires réalistes, variés en ton (pas que 5 étoiles partout)
    protected array $commentaires = [
        'Conducteur ponctuel et sympathique, trajet agréable.',
        'Bonne communication avant le départ, je recommande.',
        'Voiture propre et conduite prudente.',
        'Un peu de retard mais le trajet s\'est bien passé.',
        'Rien à redire, exactement comme annoncé.',
        'Conducteur agréable mais musique un peu forte.',
    ];

    public function definition(): array
    {
        return [
            'reservation_id' => Reservation::factory()->terminee(),
            'note' => fake()->numberBetween(3, 5), // majorité de bons avis, réaliste
            'commentaire' => fake()->randomElement($this->commentaires),
        ];
    }
}

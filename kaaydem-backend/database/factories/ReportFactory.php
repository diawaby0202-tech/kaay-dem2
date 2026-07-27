<?php

namespace Database\Factories;

use App\Enums\ReportStatus;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class ReportFactory extends Factory
{
    protected $model = \App\Models\Report::class;

    protected array $motifs = [
        'Le conducteur n\'est jamais venu au point de rendez-vous.',
        'Comportement irrespectueux pendant le trajet.',
        'Le véhicule ne correspondait pas à la description.',
        'Passager n\'a pas payé le montant convenu.',
        'Retard important sans prévenir.',
    ];

    public function definition(): array
    {
        return [
            'auteur_id' => User::factory(),
            'utilisateur_signale_id' => User::factory(),
            'motif' => fake()->randomElement($this->motifs),
            'statut_traitement' => ReportStatus::EnAttente,
        ];
    }

    public function traite(): static
    {
        return $this->state(fn () => ['statut_traitement' => ReportStatus::Traite]);
    }
}

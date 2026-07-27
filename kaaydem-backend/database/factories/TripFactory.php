<?php

namespace Database\Factories;

use App\Enums\TripStatus;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class TripFactory extends Factory
{
    protected $model = \App\Models\Trip::class;

    // Villes réelles du contexte du projet (section 1.1 du cahier des charges)
    protected array $villes = ['Dakar', 'Rufisque', 'Diamniadio', 'Bargny', 'Sébikotane', 'Thiès'];

    public function definition(): array
    {
        $depart = fake()->randomElement($this->villes);
        // On s'assure que l'arrivée est différente du départ
        $arrivee = fake()->randomElement(array_diff($this->villes, [$depart]));

        $placesTotales = fake()->numberBetween(2, 7);

        return [
            'driver_id' => User::factory(),
            'ville_depart' => $depart,
            'ville_arrivee' => $arrivee,
            'points_arret' => null, // simple par défaut ; voir état avecArrets()
            'date_heure_depart' => fake()->dateTimeBetween('now', '+2 weeks'),
            'places_totales' => $placesTotales,
            // Par défaut toutes les places sont encore libres ; les seeders
            // ajusteront ce nombre en fonction des réservations créées
            'places_disponibles' => $placesTotales,
            'prix_par_place' => fake()->numberBetween(500, 3000), // FCFA
            'statut' => TripStatus::Publie,
        ];
    }

    /** État : trajet avec un ou deux points d'arrêt intermédiaires */
    public function avecArrets(): static
    {
        return $this->state(fn () => [
            'points_arret' => [
                ['ville' => fake()->randomElement($this->villes), 'ordre' => 1],
            ],
        ]);
    }

    /** État : trajet déjà clôturé (pour générer des reviews dessus) */
    public function termine(): static
    {
        return $this->state(fn () => [
            'statut' => TripStatus::Termine,
            'date_heure_depart' => fake()->dateTimeBetween('-1 month', '-1 day'),
        ]);
    }

    /** État : trajet annulé par le conducteur */
    public function annule(): static
    {
        return $this->state(fn () => ['statut' => TripStatus::Annule]);
    }
}

<?php

namespace Database\Factories;

use App\Enums\DriverValidationStatus;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class DriverProfileFactory extends Factory
{
    protected $model = \App\Models\DriverProfile::class;

    protected array $marques = ['Toyota', 'Hyundai', 'Renault', 'Kia', 'Peugeot', 'Suzuki'];
    protected array $modeles = ['Corolla', 'Accent', 'Logan', 'Picanto', '208', 'Swift'];

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'numero_permis' => 'SN-'.fake()->unique()->numerify('#########'),
            'vehicule_marque' => fake()->randomElement($this->marques),
            'vehicule_modele' => fake()->randomElement($this->modeles),
            'immatriculation' => strtoupper(fake()->bothify('??-####-??')),
            'statut_validation' => DriverValidationStatus::EnAttente,
        ];
    }

    /** État : profil déjà validé par l'admin (EF-02) */
    public function valide(): static
    {
        return $this->state(fn () => ['statut_validation' => DriverValidationStatus::Valide]);
    }

    /** État : profil rejeté par l'admin */
    public function rejete(): static
    {
        return $this->state(fn () => ['statut_validation' => DriverValidationStatus::Rejete]);
    }
}

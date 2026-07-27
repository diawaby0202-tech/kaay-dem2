<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UserFactory extends Factory
{
    protected $model = \App\Models\User::class;

    // Campus réels du contexte (Dakar, Rufisque, Diamniadio et environs)
    protected array $campus = [
        'ESMT Dakar', 'ISEP Diamniadio', 'UCAD Dakar',
        'ESP Dakar', 'UGB Saint-Louis', 'Campus Diamniadio',
    ];

    public function definition(): array
    {
        return [
            'name' => fake('fr_FR')->firstName().' '.fake('fr_FR')->lastName(),
            'email' => fake()->unique()->safeEmail(),
            'email_verified_at' => now(),
            'password' => Hash::make('password'), // mot de passe de test : "password"
            'remember_token' => Str::random(10),
            'telephone' => '77'.fake()->numerify('#######'), // format sénégalais courant
            'campus' => fake()->randomElement($this->campus),
            'photo' => null,
            'is_admin' => false,
            'is_active' => true,
        ];
    }

    /** État : un utilisateur administrateur */
    public function admin(): static
    {
        return $this->state(fn () => ['is_admin' => true]);
    }

    /** État : un compte désactivé par l'admin (EF-09) */
    public function inactif(): static
    {
        return $this->state(fn () => ['is_active' => false]);
    }
}

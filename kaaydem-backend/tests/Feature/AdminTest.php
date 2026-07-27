<?php

use App\Models\User;
use Laravel\Sanctum\Sanctum;

it('interdit l\'accès aux routes admin à un utilisateur normal (Gate)', function () {
    Sanctum::actingAs(User::factory()->create(['is_admin' => false]));

    $this->getJson('/api/v1/admin/stats')->assertStatus(403);
});

it('autorise un administrateur à consulter les statistiques (EF-08)', function () {
    Sanctum::actingAs(User::factory()->admin()->create());

    $this->getJson('/api/v1/admin/stats')
        ->assertStatus(200)
        ->assertJsonStructure(['trajets_par_mois', 'taux_occupation_moyen', 'top_conducteurs']);
});

it('permet à un administrateur de désactiver un utilisateur (EF-09)', function () {
    Sanctum::actingAs(User::factory()->admin()->create());
    $utilisateur = User::factory()->create(['is_active' => true]);

    $this->patchJson("/api/v1/admin/users/{$utilisateur->id}", ['is_active' => false])
        ->assertStatus(200)
        ->assertJsonPath('data.is_active', false);
});

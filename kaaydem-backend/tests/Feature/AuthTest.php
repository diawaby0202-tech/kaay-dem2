<?php

use App\Models\User;

it('permet à un visiteur de s\'inscrire et reçoit un token', function () {
    $reponse = $this->postJson('/api/v1/register', [
        'name' => 'Aminata Diop',
        'email' => 'aminata@esmt.sn',
        'password' => 'password123',
        'password_confirmation' => 'password123',
    ]);

    $reponse->assertStatus(201)
        ->assertJsonStructure(['user' => ['id', 'email'], 'token']);

    $this->assertDatabaseHas('users', ['email' => 'aminata@esmt.sn']);
});

it('refuse une inscription avec un email déjà utilisé', function () {
    User::factory()->create(['email' => 'existe@esmt.sn']);

    $reponse = $this->postJson('/api/v1/register', [
        'name' => 'Test',
        'email' => 'existe@esmt.sn',
        'password' => 'password123',
        'password_confirmation' => 'password123',
    ]);

    $reponse->assertStatus(422)->assertJsonValidationErrors('email');
});

it('permet à un utilisateur de se connecter avec les bons identifiants', function () {
    User::factory()->create([
        'email' => 'user@esmt.sn',
        'password' => 'password123', // castée en hash automatiquement par le modèle
    ]);

    $reponse = $this->postJson('/api/v1/login', [
        'email' => 'user@esmt.sn',
        'password' => 'password123',
    ]);

    $reponse->assertStatus(200)->assertJsonStructure(['user', 'token']);
});

it('refuse une connexion avec un mauvais mot de passe', function () {
    User::factory()->create(['email' => 'user@esmt.sn', 'password' => 'bonmotdepasse']);

    $this->postJson('/api/v1/login', [
        'email' => 'user@esmt.sn',
        'password' => 'mauvaismotdepasse',
    ])->assertStatus(422);
});

it('bloque l\'accès à une route protégée sans token', function () {
    $this->getJson('/api/v1/me')->assertStatus(401);
});

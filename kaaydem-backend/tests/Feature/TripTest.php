<?php

use App\Models\DriverProfile;
use App\Models\Trip;
use App\Models\User;
use Laravel\Sanctum\Sanctum;

it('liste les trajets publiés sans authentification (EF-04)', function () {
    Trip::factory()->count(3)->create();

    $this->getJson('/api/v1/trips')
        ->assertStatus(200)
        ->assertJsonStructure(['data', 'meta']);
});

it('filtre les trajets par ville de départ', function () {
    Trip::factory()->create(['ville_depart' => 'Dakar']);
    Trip::factory()->create(['ville_depart' => 'Thiès']);

    $reponse = $this->getJson('/api/v1/trips?ville_depart=Dakar');

    $reponse->assertStatus(200);
    foreach ($reponse->json('data') as $trajet) {
        expect($trajet['ville_depart'])->toBe('Dakar');
    }
});

it('empêche un non-conducteur validé de publier un trajet (EF-03)', function () {
    $user = User::factory()->create();
    Sanctum::actingAs($user);

    $this->postJson('/api/v1/trips', [
        'ville_depart' => 'Dakar',
        'ville_arrivee' => 'Thiès',
        'date_heure_depart' => now()->addDay()->format('Y-m-d H:i:s'),
        'places_totales' => 4,
        'prix_par_place' => 1000,
    ])->assertStatus(403);
});

it('permet à un conducteur validé de publier un trajet', function () {
    $user = User::factory()->create();
    DriverProfile::factory()->valide()->create(['user_id' => $user->id]);
    Sanctum::actingAs($user);

    $reponse = $this->postJson('/api/v1/trips', [
        'ville_depart' => 'Dakar',
        'ville_arrivee' => 'Thiès',
        'date_heure_depart' => now()->addDay()->format('Y-m-d H:i:s'),
        'places_totales' => 4,
        'prix_par_place' => 1000,
    ]);

    $reponse->assertStatus(201);
    $this->assertDatabaseHas('trips', ['ville_depart' => 'Dakar', 'driver_id' => $user->id]);
});

it('empêche un conducteur de modifier le trajet d\'un autre (Policy)', function () {
    $auteur = User::factory()->create();
    DriverProfile::factory()->valide()->create(['user_id' => $auteur->id]);
    $trajet = Trip::factory()->create(['driver_id' => $auteur->id]);

    $autreConducteur = User::factory()->create();
    DriverProfile::factory()->valide()->create(['user_id' => $autreConducteur->id]);
    Sanctum::actingAs($autreConducteur);

    $this->putJson("/api/v1/trips/{$trajet->id}", ['prix_par_place' => 5000])
        ->assertStatus(403);
});

<?php

use App\Enums\ReservationStatus;
use App\Models\DriverProfile;
use App\Models\Trip;
use App\Models\User;
use Laravel\Sanctum\Sanctum;

/** Crée un trajet publié par un conducteur validé, avec un nombre de places donné. */
function creerTrajetPublie(int $places = 4): Trip
{
    $conducteur = User::factory()->create();
    DriverProfile::factory()->valide()->create(['user_id' => $conducteur->id]);

    return Trip::factory()->create([
        'driver_id' => $conducteur->id,
        'places_totales' => $places,
        'places_disponibles' => $places,
    ]);
}

it('permet à un passager de réserver un trajet et décrémente les places (EF-05)', function () {
    $trajet = creerTrajetPublie(4);
    Sanctum::actingAs(User::factory()->create());

    $this->postJson("/api/v1/trips/{$trajet->id}/reservations", ['nombre_places' => 2])
        ->assertStatus(201);

    expect($trajet->fresh()->places_disponibles)->toBe(2);
});

it('empêche un conducteur de réserver son propre trajet', function () {
    $conducteur = User::factory()->create();
    DriverProfile::factory()->valide()->create(['user_id' => $conducteur->id]);
    $trajet = Trip::factory()->create([
        'driver_id' => $conducteur->id, 'places_totales' => 4, 'places_disponibles' => 4,
    ]);

    Sanctum::actingAs($conducteur);

    $this->postJson("/api/v1/trips/{$trajet->id}/reservations", ['nombre_places' => 1])
        ->assertStatus(409);
});

it('refuse une réservation si les places sont insuffisantes (PlacesInsuffisantesException)', function () {
    $trajet = creerTrajetPublie(1);
    Sanctum::actingAs(User::factory()->create());

    $this->postJson("/api/v1/trips/{$trajet->id}/reservations", ['nombre_places' => 5])
        ->assertStatus(409);
});

it('permet au conducteur d\'accepter une réservation en attente (EF-06)', function () {
    $trajet = creerTrajetPublie(4);
    Sanctum::actingAs($passager = User::factory()->create());
    $idReservation = $this->postJson("/api/v1/trips/{$trajet->id}/reservations", ['nombre_places' => 1])
        ->json('data.id');

    Sanctum::actingAs($trajet->driver);

    $this->patchJson("/api/v1/reservations/{$idReservation}/accept")
        ->assertStatus(200)
        ->assertJsonPath('data.statut', ReservationStatus::Confirmee->value);
});

it('empêche un conducteur non concerné d\'accepter une réservation', function () {
    $trajet = creerTrajetPublie(4);
    Sanctum::actingAs(User::factory()->create());
    $idReservation = $this->postJson("/api/v1/trips/{$trajet->id}/reservations", ['nombre_places' => 1])
        ->json('data.id');

    Sanctum::actingAs(User::factory()->create()); // un conducteur qui n'a rien à voir

    $this->patchJson("/api/v1/reservations/{$idReservation}/accept")->assertStatus(403);
});

it('restitue les places quand une réservation est refusée', function () {
    $trajet = creerTrajetPublie(4);
    Sanctum::actingAs(User::factory()->create());
    $idReservation = $this->postJson("/api/v1/trips/{$trajet->id}/reservations", ['nombre_places' => 2])
        ->json('data.id');

    expect($trajet->fresh()->places_disponibles)->toBe(2);

    Sanctum::actingAs($trajet->driver);
    $this->patchJson("/api/v1/reservations/{$idReservation}/refuse")->assertStatus(200);

    expect($trajet->fresh()->places_disponibles)->toBe(4);
});

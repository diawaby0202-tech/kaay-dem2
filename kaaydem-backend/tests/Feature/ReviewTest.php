<?php

use App\Models\DriverProfile;
use App\Models\Reservation;
use App\Models\Trip;
use App\Models\User;
use Laravel\Sanctum\Sanctum;

function creerReservation(string $statutFactory, User $passager): array
{
    $conducteur = User::factory()->create();
    DriverProfile::factory()->valide()->create(['user_id' => $conducteur->id]);
    $trajet = Trip::factory()->create(['driver_id' => $conducteur->id]);

    $reservation = Reservation::factory()->{$statutFactory}()->create([
        'trip_id' => $trajet->id,
        'passenger_id' => $passager->id,
    ]);

    return [$trajet, $reservation];
}

it('empêche de noter un trajet qui n\'est pas encore terminé (EF-07)', function () {
    $passager = User::factory()->create();
    [, $reservation] = creerReservation('confirmee', $passager);

    Sanctum::actingAs($passager);

    $this->postJson("/api/v1/reservations/{$reservation->id}/review", ['note' => 5])
        ->assertStatus(403);
});

it('permet de noter un trajet terminé', function () {
    $passager = User::factory()->create();
    [, $reservation] = creerReservation('terminee', $passager);

    Sanctum::actingAs($passager);

    $this->postJson("/api/v1/reservations/{$reservation->id}/review", [
        'note' => 5,
        'commentaire' => 'Très bon trajet',
    ])->assertStatus(201);

    $this->assertDatabaseHas('reviews', ['reservation_id' => $reservation->id, 'note' => 5]);
});

it('empêche un second avis sur la même réservation (AvisDejaDonneException)', function () {
    $passager = User::factory()->create();
    [, $reservation] = creerReservation('terminee', $passager);

    Sanctum::actingAs($passager);
    $this->postJson("/api/v1/reservations/{$reservation->id}/review", ['note' => 4]);

    $this->postJson("/api/v1/reservations/{$reservation->id}/review", ['note' => 5])
        ->assertStatus(409);
});

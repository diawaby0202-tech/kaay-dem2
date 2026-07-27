<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory;

    protected $fillable = [
        'name', 'email', 'password',
        'telephone', 'campus', 'photo',
        'is_admin', 'is_active', 'solde',
    ];

    protected $hidden = ['password', 'remember_token'];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_admin' => 'boolean',
            'is_active' => 'boolean',
            'solde' => 'decimal:2',
        ];
    }

    // --- Relations liées au rôle "conducteur" ---

    /** Le profil conducteur, s'il existe (relation 1-1) */
    public function driverProfile(): HasOne
    {
        return $this->hasOne(DriverProfile::class);
    }

    /** Les trajets que CET utilisateur a publiés en tant que conducteur */
    public function tripsAsDriver(): HasMany
    {
        return $this->hasMany(Trip::class, 'driver_id');
    }

    // --- Relations liées au rôle "passager" ---

    /** Les réservations que CET utilisateur a faites en tant que passager */
    public function reservationsAsPassenger(): HasMany
    {
        return $this->hasMany(Reservation::class, 'passenger_id');
    }

    /** Historique du portefeuille virtuel (exigence bonus : paiement simulé) */
    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class)->latest();
    }

    // --- Aide métier ---

    /** Vrai si l'utilisateur a un profil conducteur validé */
    public function estConducteurValide(): bool
    {
        return $this->driverProfile?->statut_validation === \App\Enums\DriverValidationStatus::Valide;
    }

    /**
     * Note moyenne du conducteur (EF-07 : "note moyenne visible sur le
     * profil conducteur"). Retourne null s'il n'a encore aucun avis.
     */
    public function noteMoyenne(): ?float
    {
        $moyenne = \App\Models\Review::whereHas(
            'reservation.trip',
            fn ($query) => $query->where('driver_id', $this->id)
        )->avg('note');

        return $moyenne !== null ? round($moyenne, 1) : null;
    }
}

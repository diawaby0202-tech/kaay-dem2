<?php

namespace App\Models;

use App\Enums\TripStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Trip extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'driver_id', 'ville_depart', 'ville_arrivee', 'points_arret',
        'date_heure_depart', 'places_totales', 'places_disponibles',
        'prix_par_place', 'statut',
    ];

    protected function casts(): array
    {
        return [
            'points_arret' => 'array',
            'date_heure_depart' => 'datetime',
            'prix_par_place' => 'decimal:2',
            'statut' => TripStatus::class,
        ];
    }

    public function driver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'driver_id');
    }

    public function reservations(): HasMany
    {
        return $this->hasMany(Reservation::class);
    }

    /** Un trajet ne peut plus être modifié dès qu'une réservation est confirmée (EF-03) */
    public function estModifiable(): bool
    {
        return ! $this->reservations()
            ->where('statut', \App\Enums\ReservationStatus::Confirmee->value)
            ->exists();
    }
}

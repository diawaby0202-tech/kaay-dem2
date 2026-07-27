<?php

namespace App\Models;

use App\Enums\ReservationStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class Reservation extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'trip_id', 'passenger_id', 'nombre_places', 'statut',
    ];

    protected function casts(): array
    {
        return [
            'statut' => ReservationStatus::class,
        ];
    }

    public function trip(): BelongsTo
    {
        return $this->belongsTo(Trip::class);
    }

    public function passenger(): BelongsTo
    {
        return $this->belongsTo(User::class, 'passenger_id');
    }

    /** L'historique des transitions de statut (EF-06) */
    public function statusHistories(): HasMany
    {
        return $this->hasMany(ReservationStatusHistory::class);
    }

    /** L'évaluation laissée après le trajet (EF-07) */
    public function review(): HasOne
    {
        return $this->hasOne(Review::class);
    }

    /** Messagerie interne conducteur-passager (exigence bonus) */
    public function messages(): HasMany
    {
        return $this->hasMany(Message::class)->orderBy('created_at');
    }
}

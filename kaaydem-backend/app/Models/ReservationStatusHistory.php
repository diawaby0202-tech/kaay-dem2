<?php

namespace App\Models;

use App\Enums\ReservationStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ReservationStatusHistory extends Model
{
    use HasFactory;

    public $timestamps = false; // seulement created_at, géré manuellement

    protected $fillable = ['reservation_id', 'statut', 'acteur_id', 'created_at'];

    protected function casts(): array
    {
        return [
            'statut' => ReservationStatus::class,
            'created_at' => 'datetime',
        ];
    }

    public function reservation(): BelongsTo
    {
        return $this->belongsTo(Reservation::class);
    }

    public function acteur(): BelongsTo
    {
        return $this->belongsTo(User::class, 'acteur_id');
    }
}

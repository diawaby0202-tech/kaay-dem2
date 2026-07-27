<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateTripRequest extends FormRequest
{
    public function authorize(): bool
    {
        // $this->route('trip') récupère automatiquement le modèle Trip
        // grâce au "route model binding" (voir routes/api.php)
        return $this->user()->can('update', $this->route('trip'));
    }

    public function rules(): array
    {
        return [
            'ville_depart' => ['sometimes', 'string', 'max:255'],
            'ville_arrivee' => ['sometimes', 'string', 'max:255', 'different:ville_depart'],
            'points_arret' => ['sometimes', 'nullable', 'array'],
            'date_heure_depart' => ['sometimes', 'date', 'after:now'],
            'places_totales' => ['sometimes', 'integer', 'min:1', 'max:8'],
            'prix_par_place' => ['sometimes', 'numeric', 'min:0'],
        ];
    }
}

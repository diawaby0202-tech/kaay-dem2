<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SearchTripRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // recherche publique, accessible à tous (visiteur inclus)
    }

    public function rules(): array
    {
        return [
            'ville_depart' => ['sometimes', 'string', 'max:255'],
            'ville_arrivee' => ['sometimes', 'string', 'max:255'],
            'date' => ['sometimes', 'date'],
            'prix_max' => ['sometimes', 'numeric', 'min:0'],
            'places_min' => ['sometimes', 'integer', 'min:1'],
            'par_page' => ['sometimes', 'integer', 'min:1', 'max:50'],
        ];
    }
}

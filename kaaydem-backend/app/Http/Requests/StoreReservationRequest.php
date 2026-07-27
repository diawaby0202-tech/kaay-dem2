<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreReservationRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Tout utilisateur connecté peut réserver ; les vraies règles
        // métier (pas son propre trajet, places suffisantes, pas de
        // chevauchement) sont vérifiées dans ReservationService, car
        // elles ont besoin du Trip ciblé, pas seulement de l'utilisateur.
        return true;
    }

    public function rules(): array
    {
        return [
            'nombre_places' => ['required', 'integer', 'min:1', 'max:8'],
        ];
    }
}

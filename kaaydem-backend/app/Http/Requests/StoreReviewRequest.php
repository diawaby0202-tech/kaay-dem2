<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreReviewRequest extends FormRequest
{
    public function authorize(): bool
    {
        // La vraie règle (réservation terminée + c'est bien le passager
        // + pas déjà noté) est vérifiée dans le contrôleur/service, car
        // elle dépend de la Reservation ciblée, pas seulement de l'utilisateur.
        return true;
    }

    public function rules(): array
    {
        return [
            'note' => ['required', 'integer', 'min:1', 'max:5'],
            'commentaire' => ['nullable', 'string', 'max:1000'],
        ];
    }
}

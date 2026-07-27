<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreMessageRequest extends FormRequest
{
    public function authorize(): bool
    {
        // La vraie règle (participant + réservation engagée) est vérifiée
        // dans le contrôleur via MessagePolicy, car elle dépend de la
        // Reservation ciblée.
        return true;
    }

    public function rules(): array
    {
        return [
            'contenu' => ['required', 'string', 'max:2000'],
        ];
    }
}

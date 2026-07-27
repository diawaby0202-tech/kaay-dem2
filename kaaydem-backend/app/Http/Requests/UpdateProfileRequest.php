<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Toujours vrai : la policy n'a pas de sens ici, on modifie TOUJOURS
        // son propre profil (l'utilisateur connecté), jamais celui d'un autre
        return true;
    }

    public function rules(): array
    {
        return [
            // "sometimes" = le champ est optionnel, mais s'il est présent, on le valide
            'name' => ['sometimes', 'string', 'max:255'],
            'telephone' => ['sometimes', 'nullable', 'string', 'max:20'],
            'campus' => ['sometimes', 'nullable', 'string', 'max:255'],
            'photo' => ['sometimes', 'nullable', 'image', 'max:2048'], // 2 Mo max
        ];
    }
}

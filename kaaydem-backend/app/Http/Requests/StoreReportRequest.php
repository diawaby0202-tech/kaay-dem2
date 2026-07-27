<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreReportRequest extends FormRequest
{
    public function authorize(): bool
    {
        // La vraie règle (l'utilisateur doit être passager ou conducteur de
        // cette réservation) est vérifiée dans le contrôleur via ReportPolicy,
        // car elle dépend de la Reservation ciblée, pas seulement de l'utilisateur.
        return true;
    }

    public function rules(): array
    {
        return [
            'motif' => ['required', 'string', 'min:10', 'max:1000'],
        ];
    }
}

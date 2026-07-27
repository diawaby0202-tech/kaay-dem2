<?php

namespace App\Exceptions;

use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Levée quand un utilisateur a déjà un driver_profile (en attente,
 * validé ou rejeté) et tente d'en soumettre un nouveau.
 * Le code 409 (Conflict) est celui attendu par le cahier des charges
 * pour ce type d'erreur métier (voir section 3.2, exemple PlacesInsuffisantesException).
 */
class DemandeConducteurExistanteException extends Exception
{
    public function render(Request $request): JsonResponse
    {
        return response()->json([
            'message' => 'Vous avez déjà une demande de statut conducteur (en attente, validée ou rejetée).',
        ], 409);
    }
}

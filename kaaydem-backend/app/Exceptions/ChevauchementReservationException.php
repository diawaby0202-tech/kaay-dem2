<?php

namespace App\Exceptions;

use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Levée quand le passager a déjà une réservation active (en attente ou
 * confirmée) sur un trajet dont l'horaire chevauche celui qu'il essaie
 * de réserver (EF-05).
 */
class ChevauchementReservationException extends Exception
{
    public function render(Request $request): JsonResponse
    {
        return response()->json([
            'message' => 'Vous avez déjà une réservation active sur un trajet à un horaire proche.',
        ], 409);
    }
}

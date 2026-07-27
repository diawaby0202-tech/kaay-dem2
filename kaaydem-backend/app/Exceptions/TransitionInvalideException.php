<?php

namespace App\Exceptions;

use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Levée quand on tente une transition impossible dans le cycle de vie
 * d'une réservation (ex: accepter une réservation déjà refusée).
 */
class TransitionInvalideException extends Exception
{
    public function render(Request $request): JsonResponse
    {
        return response()->json([
            'message' => $this->getMessage() ?: 'Cette transition de statut n\'est pas autorisée.',
        ], 409);
    }
}

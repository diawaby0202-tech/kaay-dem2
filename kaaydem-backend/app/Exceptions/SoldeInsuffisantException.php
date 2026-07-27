<?php

namespace App\Exceptions;

use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/** Levée lors d'une réservation si le solde du portefeuille virtuel du passager est insuffisant */
class SoldeInsuffisantException extends Exception
{
    public function render(Request $request): JsonResponse
    {
        return response()->json([
            'message' => 'Solde insuffisant sur votre portefeuille pour effectuer cette réservation.',
        ], 409);
    }
}

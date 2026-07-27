<?php

namespace App\Exceptions;

use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AvisDejaDonneException extends Exception
{
    public function render(Request $request): JsonResponse
    {
        return response()->json([
            'message' => 'Vous avez déjà laissé un avis pour ce trajet.',
        ], 409);
    }
}

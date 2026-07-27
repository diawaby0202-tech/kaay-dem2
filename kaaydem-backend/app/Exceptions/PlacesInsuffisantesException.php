<?php

namespace App\Exceptions;

use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/** Exemple donné explicitement par le cahier des charges (section 3.2) */
class PlacesInsuffisantesException extends Exception
{
    public function render(Request $request): JsonResponse
    {
        return response()->json([
            'message' => 'Il n\'y a plus assez de places disponibles sur ce trajet.',
        ], 409);
    }
}

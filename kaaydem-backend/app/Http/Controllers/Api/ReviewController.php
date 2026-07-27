<?php

namespace App\Http\Controllers\Api;

use App\Exceptions\AvisDejaDonneException;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreReviewRequest;
use App\Http\Resources\ReviewResource;
use App\Models\Reservation;
use App\Models\Review;
use Illuminate\Http\JsonResponse;

class ReviewController extends Controller
{
    /** POST /api/v1/reservations/{reservation}/review (EF-07) */
    public function store(StoreReviewRequest $request, Reservation $reservation): JsonResponse
    {
        // Autorisation : passager de la réservation + trajet terminé
        // (voir ReviewPolicy::create). Le tableau [Review::class, $reservation]
        // dit à Laravel : "résous la policy pour Review, mais passe $reservation
        // en 2e argument à la méthode create()".
        $this->authorize('create', [Review::class, $reservation]);

        // Unicité : un seul avis par réservation (contrainte déjà en base
        // via unique() sur reservation_id, mais on vérifie avant pour
        // renvoyer un message clair plutôt qu'une erreur SQL brute)
        if ($reservation->review()->exists()) {
            throw new AvisDejaDonneException;
        }

        $avis = Review::create([
            'reservation_id' => $reservation->id,
            ...$request->validated(),
        ]);

        return (new ReviewResource($avis))->response()->setStatusCode(201);
    }
}

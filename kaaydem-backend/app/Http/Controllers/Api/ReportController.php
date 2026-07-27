<?php

namespace App\Http\Controllers\Api;

use App\Enums\ReportStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreReportRequest;
use App\Http\Resources\ReportResource;
use App\Models\Report;
use App\Models\Reservation;
use Illuminate\Http\JsonResponse;

class ReportController extends Controller
{
    /** POST /api/v1/reservations/{reservation}/report */
    public function store(StoreReportRequest $request, Reservation $reservation): JsonResponse
    {
        // Autorisation : l'utilisateur doit être partie prenante de cette
        // réservation (passager ou conducteur), et celle-ci doit avoir
        // réellement eu lieu (voir ReportPolicy::create).
        $this->authorize('create', [Report::class, $reservation]);

        $reservation->loadMissing('trip');
        $utilisateur = $request->user();

        // On signale toujours "l'autre partie" : le passager signale le
        // conducteur, et le conducteur signale le passager.
        $utilisateurSignaleId = $utilisateur->id === $reservation->passenger_id
            ? $reservation->trip->driver_id
            : $reservation->passenger_id;

        $signalement = Report::create([
            'auteur_id' => $utilisateur->id,
            'utilisateur_signale_id' => $utilisateurSignaleId,
            'motif' => $request->validated('motif'),
            'statut_traitement' => ReportStatus::EnAttente,
        ]);

        return (new ReportResource($signalement->load(['auteur', 'utilisateurSignale'])))
            ->response()
            ->setStatusCode(201);
    }
}

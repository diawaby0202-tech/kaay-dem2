<?php

namespace App\Http\Controllers\Api;

use App\Enums\ReservationStatus;
use App\Http\Controllers\Controller;
use App\Models\Reservation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    /**
     * GET /api/v1/me/notifications (EF-06 : "notifications visibles dans
     * l'interface, cloche ou badge"). Plutôt qu'un flux d'événements avec
     * un statut lu/non-lu (qui demanderait une table dédiée), on expose un
     * compteur d'éléments qui attendent réellement une action de
     * l'utilisateur connecté — ce qui est le sens pratique d'une
     * notification pour ce cas d'usage :
     *  - conducteur : demandes de réservation en attente sur ses trajets ;
     *  - passager : trajets terminés pour lesquels il n'a pas encore laissé
     *    d'avis.
     */
    public function index(Request $request): JsonResponse
    {
        $utilisateur = $request->user();

        $demandesEnAttente = Reservation::whereHas(
            'trip',
            fn ($q) => $q->where('driver_id', $utilisateur->id)
        )->where('statut', ReservationStatus::EnAttente)->count();

        $avisALaisser = Reservation::where('passenger_id', $utilisateur->id)
            ->where('statut', ReservationStatus::Terminee)
            ->whereDoesntHave('review')
            ->count();

        return response()->json([
            'demandes_en_attente' => $demandesEnAttente,
            'avis_a_laisser' => $avisALaisser,
            'total' => $demandesEnAttente + $avisALaisser,
        ]);
    }
}

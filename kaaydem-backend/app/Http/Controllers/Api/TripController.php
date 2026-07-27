<?php

namespace App\Http\Controllers\Api;

use App\Enums\TripStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\SearchTripRequest;
use App\Http\Requests\StoreTripRequest;
use App\Http\Requests\UpdateTripRequest;
use App\Http\Resources\TripResource;
use App\Models\Trip;
use App\Services\ReservationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class TripController extends Controller
{
    public function __construct(private ReservationService $reservations) {}

    /**
     * GET /api/v1/trips
     * Recherche publique avec filtres (EF-04). Accessible sans connexion.
     */
    public function index(SearchTripRequest $request): AnonymousResourceCollection
    {
        $query = Trip::query()
            ->with('driver')
            // On ne montre jamais un trajet annulé/terminé dans la recherche publique
            ->where('statut', TripStatus::Publie);

        if ($request->filled('ville_depart')) {
            $query->where('ville_depart', 'like', '%'.$request->ville_depart.'%');
        }

        if ($request->filled('ville_arrivee')) {
            $query->where('ville_arrivee', 'like', '%'.$request->ville_arrivee.'%');
        }

        if ($request->filled('date')) {
            $query->whereDate('date_heure_depart', $request->date);
        }

        if ($request->filled('prix_max')) {
            $query->where('prix_par_place', '<=', $request->prix_max);
        }

        if ($request->filled('places_min')) {
            $query->where('places_disponibles', '>=', $request->places_min);
        }

        $trajets = $query
            ->orderBy('date_heure_depart') // les plus proches en premier
            ->paginate($request->integer('par_page', 10));

        return TripResource::collection($trajets);
    }

    /** GET /api/v1/me/trips — trajets publiés par l'utilisateur connecté (EF-08) */
    public function mesTrajets(): AnonymousResourceCollection
    {
        $trajets = request()->user()
            ->tripsAsDriver()
            ->with(['driver', 'reservations.passenger'])
            ->latest()
            ->get();

        return TripResource::collection($trajets);
    }

    /** POST /api/v1/trips (EF-03) */
    public function store(StoreTripRequest $request): JsonResponse
    {
        $trajet = Trip::create([
            ...$request->validated(),
            'driver_id' => $request->user()->id,
            // À la création, toutes les places sont disponibles
            'places_disponibles' => $request->places_totales,
            'statut' => TripStatus::Publie,
        ]);

        return (new TripResource($trajet->load('driver')))
            ->response()
            ->setStatusCode(201);
    }

    /** GET /api/v1/trips/{trip} — détail public */
    public function show(Trip $trip): TripResource
    {
        return new TripResource($trip->load('driver'));
    }

    /** PUT /api/v1/trips/{trip} (EF-03 : bloqué si réservation confirmée, via la Policy) */
    public function update(UpdateTripRequest $request, Trip $trip): TripResource
    {
        $trip->fill($request->validated());

        // Si places_totales a changé, on ajuste les disponibles à l'identique
        // (sûr ici : la Policy garantit qu'aucune réservation n'est confirmée,
        // donc places_disponibles == places_totales avant modification)
        if ($request->filled('places_totales')) {
            $trip->places_disponibles = $request->places_totales;
        }

        $trip->save();

        return new TripResource($trip->load('driver'));
    }

    /** DELETE /api/v1/trips/{trip} — annulation (EF-03) */
    public function destroy(Trip $trip): JsonResponse
    {
        $this->authorize('delete', $trip);

        $trip->statut = TripStatus::Annule;
        $trip->save();
        $trip->delete(); // soft delete : garde une trace pour les stats admin

        return response()->json(['message' => 'Trajet annulé avec succès.']);
    }

    /** PATCH /api/v1/trips/{trip}/close — clôture par le conducteur (section 4 de l'API) */
    public function close(Trip $trip): JsonResponse
    {
        $this->authorize('close', $trip);

        if ($trip->statut === TripStatus::Termine || $trip->statut === TripStatus::Annule) {
            return response()->json(['message' => 'Ce trajet est déjà clôturé ou annulé.'], 409);
        }

        $trip->statut = TripStatus::Termine;
        $trip->save();

        // Toutes les réservations confirmées passent à "terminée" (permet
        // ensuite au passager de laisser un avis, EF-07)
        $this->reservations->terminerReservationsConfirmees($trip, request()->user());

        return response()->json([
            'message' => 'Trajet clôturé avec succès.',
            'trip' => new TripResource($trip->load('driver')),
        ]);
    }
}

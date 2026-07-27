<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreReservationRequest;
use App\Http\Resources\ReservationResource;
use App\Models\Reservation;
use App\Models\Trip;
use App\Services\ReservationService;
use Illuminate\Http\JsonResponse;

class ReservationController extends Controller
{
    // Laravel injecte automatiquement le service dans le constructeur
    public function __construct(private ReservationService $reservations) {}

    /** GET /api/v1/me/reservations — réservations du passager connecté (EF-08) */
    public function mesReservations(): \Illuminate\Http\Resources\Json\AnonymousResourceCollection
    {
        $mesReservations = request()->user()
            ->reservationsAsPassenger()
            ->with(['trip.driver', 'passenger', 'statusHistories'])
            ->latest()
            ->get();

        return ReservationResource::collection($mesReservations);
    }

    /** POST /api/v1/trips/{trip}/reservations (EF-05) */
    public function store(StoreReservationRequest $request, Trip $trip): JsonResponse
    {
        $reservation = $this->reservations->reserver(
            $trip,
            $request->user(),
            $request->integer('nombre_places')
        );

        return (new ReservationResource($reservation->load(['trip', 'passenger'])))
            ->response()
            ->setStatusCode(201);
    }

    /** PATCH /api/v1/reservations/{reservation}/accept (EF-06) */
    public function accept(Reservation $reservation): ReservationResource
    {
        $this->authorize('gererParConducteur', $reservation);

        $reservation = $this->reservations->confirmer($reservation, request()->user());

        return new ReservationResource($reservation->load(['trip', 'passenger', 'statusHistories']));
    }

    /** PATCH /api/v1/reservations/{reservation}/refuse (EF-06) */
    public function refuse(Reservation $reservation): ReservationResource
    {
        $this->authorize('gererParConducteur', $reservation);

        $reservation = $this->reservations->refuser($reservation, request()->user());

        return new ReservationResource($reservation->load(['trip', 'passenger', 'statusHistories']));
    }

    /** PATCH /api/v1/reservations/{reservation}/cancel */
    public function cancel(Reservation $reservation): ReservationResource
    {
        $this->authorize('annulerParPassager', $reservation);

        $reservation = $this->reservations->annulerParPassager($reservation, request()->user());

        return new ReservationResource($reservation->load(['trip', 'passenger', 'statusHistories']));
    }
}

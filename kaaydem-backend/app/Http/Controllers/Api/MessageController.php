<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreMessageRequest;
use App\Http\Resources\MessageResource;
use App\Models\Message;
use App\Models\Reservation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class MessageController extends Controller
{
    /**
     * GET /api/v1/reservations/{reservation}/messages
     * Messagerie interne (exigence bonus) : simple polling côté
     * frontend plutôt que des WebSockets, suffisant pour ce cas d'usage
     * et sans infrastructure supplémentaire à déployer.
     */
    public function index(Reservation $reservation): AnonymousResourceCollection
    {
        $this->authorize('participer', [Message::class, $reservation]);

        return MessageResource::collection(
            $reservation->messages()->with('auteur')->get()
        );
    }

    /** POST /api/v1/reservations/{reservation}/messages */
    public function store(StoreMessageRequest $request, Reservation $reservation): JsonResponse
    {
        $this->authorize('participer', [Message::class, $reservation]);

        $message = Message::create([
            'reservation_id' => $reservation->id,
            'auteur_id' => $request->user()->id,
            'contenu' => $request->validated('contenu'),
        ]);

        return (new MessageResource($message->load('auteur')))
            ->response()
            ->setStatusCode(201);
    }
}

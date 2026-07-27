<?php

namespace App\Mail;

use App\Models\Reservation;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;

/**
 * Envoyée au passager quand le conducteur accepte sa demande de
 * réservation. Implémente ShouldQueue : l'envoi passe par la file
 * d'attente (table `jobs`) plutôt que de bloquer la requête HTTP —
 * exigence bonus du cahier des charges ("notifications par e-mail via
 * les files d'attente Laravel").
 */
class ReservationConfirmeeMail extends Mailable implements ShouldQueue
{
    use Queueable;

    public function __construct(public Reservation $reservation) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Votre réservation est confirmée — Kaay Dem !',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.reservation-confirmee',
            with: [
                'passager' => $this->reservation->passenger,
                'trajet' => $this->reservation->trip,
                'reservation' => $this->reservation,
            ],
        );
    }
}

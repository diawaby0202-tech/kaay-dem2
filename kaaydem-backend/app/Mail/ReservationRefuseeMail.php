<?php

namespace App\Mail;

use App\Models\Reservation;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;

/**
 * Envoyée au passager quand le conducteur refuse sa demande de
 * réservation. Voir ReservationConfirmeeMail pour la justification de
 * ShouldQueue.
 */
class ReservationRefuseeMail extends Mailable implements ShouldQueue
{
    use Queueable;

    public function __construct(public Reservation $reservation) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Votre demande de réservation a été refusée — Kaay Dem !',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.reservation-refusee',
            with: [
                'passager' => $this->reservation->passenger,
                'trajet' => $this->reservation->trip,
            ],
        );
    }
}

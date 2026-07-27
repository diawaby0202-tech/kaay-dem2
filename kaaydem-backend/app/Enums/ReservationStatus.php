<?php

namespace App\Enums;

enum ReservationStatus: string
{
    case EnAttente = 'en_attente';   // demande envoyée, conducteur n'a pas répondu
    case Confirmee = 'confirmee';    // conducteur a accepté
    case Terminee = 'terminee';      // trajet clôturé avec succès
    case Annulee = 'annulee';        // annulée par le passager
    case Refusee = 'refusee';        // refusée par le conducteur
}

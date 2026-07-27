<?php

namespace App\Enums;

enum TripStatus: string
{
    case Publie = 'publie';       // trajet publié, ouvert aux réservations
    case Complet = 'complet';     // toutes les places sont réservées
    case EnCours = 'en_cours';    // le conducteur a démarré le trajet
    case Termine = 'termine';     // le conducteur a clôturé le trajet
    case Annule = 'annule';       // le conducteur a annulé le trajet
}

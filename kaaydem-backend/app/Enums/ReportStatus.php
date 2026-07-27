<?php

namespace App\Enums;

enum ReportStatus: string
{
    case EnAttente = 'en_attente';
    case Traite = 'traite';
    case Rejete = 'rejete';
}

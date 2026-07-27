<?php

namespace App\Enums;

enum TransactionType: string
{
    case Debit = 'debit';   // argent qui quitte le portefeuille
    case Credit = 'credit'; // argent qui entre dans le portefeuille
}

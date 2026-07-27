<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\TransactionResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class WalletController extends Controller
{
    /**
     * GET /api/v1/me/transactions
     * Historique du portefeuille virtuel (exigence bonus : paiement
     * simulé). Le solde courant, lui, est déjà renvoyé par /me (voir
     * UserResource) — inutile de le dupliquer ici.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        return TransactionResource::collection(
            $request->user()->transactions()->paginate(20)
        );
    }
}

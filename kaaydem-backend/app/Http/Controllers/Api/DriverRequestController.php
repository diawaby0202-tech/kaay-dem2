<?php

namespace App\Http\Controllers\Api;

use App\Exceptions\DemandeConducteurExistanteException;
use App\Http\Controllers\Controller;
use App\Http\Requests\DriverRequestRequest;
use App\Models\DriverProfile;
use Illuminate\Http\JsonResponse;

class DriverRequestController extends Controller
{
    /** POST /api/v1/driver-requests (EF-02) */
    public function store(DriverRequestRequest $request): JsonResponse
    {
        $user = $request->user();

        // Un utilisateur ne peut avoir qu'UN SEUL profil conducteur
        // (relation 1-1 imposée par la migration : unique() sur user_id)
        if ($user->driverProfile) {
            throw new DemandeConducteurExistanteException;
        }

        $profil = DriverProfile::create([
            'user_id' => $user->id,
            ...$request->validated(),
            // statut_validation reste "en_attente" par défaut (colonne de la migration)
            // -> c'est l'admin qui la fera passer à "valide" ou "rejete" (route admin, plus tard)
        ]);

        return response()->json([
            'message' => 'Votre demande a été envoyée et est en attente de validation.',
            'driver_profile' => $profil,
        ], 201);
    }
}

<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Http\Requests\UpdateProfileRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /** POST /api/v1/register */
    public function register(RegisterRequest $request): JsonResponse
    {
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'telephone' => $request->telephone,
            'campus' => $request->campus,
        ]);

        // Recharge le modèle depuis la base : le solde par défaut du
        // portefeuille virtuel (10000) est appliqué côté base de données,
        // mais Eloquent ne le reflète pas automatiquement sur l'objet en
        // mémoire juste après create() — sans ce refresh(), la réponse
        // d'inscription afficherait un solde vide.
        $user->refresh();

        // Un seul token par connexion : simple pour un projet de ce type.
        // Sanctum permet d'en créer plusieurs (un par appareil) si besoin.
        $token = $user->createToken('api-token')->plainTextToken;

        return response()->json([
            'user' => new UserResource($user),
            'token' => $token,
        ], 201); // 201 = ressource créée
    }

    /** POST /api/v1/login */
    public function login(LoginRequest $request): JsonResponse
    {
        $user = User::where('email', $request->email)->first();

        // On vérifie manuellement (pas de session web ici, juste des tokens API)
        if (! $user || ! Hash::check($request->password, $user->password)) {
            // ValidationException -> Laravel formate automatiquement en JSON 422
            throw ValidationException::withMessages([
                'email' => ['Identifiants incorrects.'],
            ]);
        }

        if (! $user->is_active) {
            return response()->json([
                'message' => 'Ce compte a été désactivé par un administrateur.',
            ], 403);
        }

        $token = $user->createToken('api-token')->plainTextToken;

        return response()->json([
            'user' => new UserResource($user),
            'token' => $token,
        ]);
    }

    /** POST /api/v1/logout */
    public function logout(Request $request): JsonResponse
    {
        // Supprime UNIQUEMENT le token utilisé pour cette requête
        // (pas tous les tokens de l'utilisateur, au cas où il serait
        // connecté sur plusieurs appareils)
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Déconnexion réussie.']);
    }

    /** GET /api/v1/me */
    public function me(Request $request): UserResource
    {
        return new UserResource($request->user()->load('driverProfile'));
    }

    /** PUT /api/v1/me */
    public function updateMe(UpdateProfileRequest $request): UserResource
    {
        $user = $request->user();

        $user->fill($request->only(['name', 'telephone', 'campus']));

        if ($request->hasFile('photo')) {
            // Stocke dans storage/app/public/photos, accessible via /storage/photos/...
            // après un `php artisan storage:link`
            $chemin = $request->file('photo')->store('photos', 'public');
            $user->photo = $chemin;
        }

        $user->save();

        return new UserResource($user);
    }
}

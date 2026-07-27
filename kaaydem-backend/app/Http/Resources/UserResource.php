<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    /**
     * Contrôle EXACTEMENT ce qui est renvoyé au frontend.
     * Sans ça, toArray($request) par défaut renverrait TOUTES les colonnes,
     * y compris le mot de passe haché — dangereux.
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'telephone' => $this->telephone,
            'campus' => $this->campus,
            'photo' => $this->photo,
            'is_admin' => $this->is_admin,
            'is_active' => $this->is_active,
            'solde' => $this->solde,

            // Vrai uniquement si un driver_profile existe ET est validé
            'est_conducteur_valide' => $this->estConducteurValide(),

            // Note moyenne (EF-07). null si aucun avis reçu pour l'instant.
            'note_moyenne' => $this->noteMoyenne(),

            // "whenLoaded" : n'inclut ce bloc QUE si la relation a été chargée
            // avec ->load('driverProfile') — évite une requête SQL en trop
            // si on n'en a pas besoin à cet endroit de l'API.
            'driver_profile' => $this->whenLoaded('driverProfile', fn () => $this->driverProfile ? [
                'numero_permis' => $this->driverProfile->numero_permis,
                'vehicule_marque' => $this->driverProfile->vehicule_marque,
                'vehicule_modele' => $this->driverProfile->vehicule_modele,
                'statut_validation' => $this->driverProfile->statut_validation,
            ] : null),

            'created_at' => $this->created_at,
        ];
    }
}

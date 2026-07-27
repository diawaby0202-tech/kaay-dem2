<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ReservationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'nombre_places' => $this->nombre_places,
            'statut' => $this->statut,

            'trip' => [
                'id' => $this->trip->id,
                'ville_depart' => $this->trip->ville_depart,
                'ville_arrivee' => $this->trip->ville_arrivee,
                'date_heure_depart' => $this->trip->date_heure_depart,
            ],

            'passager' => [
                'id' => $this->passenger->id,
                'name' => $this->passenger->name,
            ],

            // L'historique complet des transitions (EF-06), utile pour
            // afficher une timeline dans le frontend
            'historique' => $this->whenLoaded('statusHistories', fn () => $this->statusHistories->map(fn ($h) => [
                'statut' => $h->statut,
                'acteur_id' => $h->acteur_id,
                'date' => $h->created_at,
            ])),

            'created_at' => $this->created_at,
        ];
    }
}

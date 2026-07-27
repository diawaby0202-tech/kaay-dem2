<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TripResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'ville_depart' => $this->ville_depart,
            'ville_arrivee' => $this->ville_arrivee,
            'points_arret' => $this->points_arret,
            'date_heure_depart' => $this->date_heure_depart,
            'places_totales' => $this->places_totales,
            'places_disponibles' => $this->places_disponibles,
            'prix_par_place' => $this->prix_par_place,
            'statut' => $this->statut,

            // Infos publiques du conducteur (jamais son email/téléphone ici,
            // seulement ce qui aide un passager à choisir un trajet)
            'conducteur' => [
                'id' => $this->driver->id,
                'name' => $this->driver->name,
                'photo' => $this->driver->photo,
                'note_moyenne' => $this->driver->noteMoyenne(),
            ],

            // Uniquement rempli quand on charge ->load('reservations.passenger')
            // (utilisé sur le tableau de bord conducteur, EF-08)
            'reservations' => $this->whenLoaded('reservations', fn () => $this->reservations->map(fn ($r) => [
                'id' => $r->id,
                'statut' => $r->statut,
                'nombre_places' => $r->nombre_places,
                'passager' => ['id' => $r->passenger->id, 'name' => $r->passenger->name],
            ])),

            'created_at' => $this->created_at,
        ];
    }
}

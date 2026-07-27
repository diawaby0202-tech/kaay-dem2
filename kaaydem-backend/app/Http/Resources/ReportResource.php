<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ReportResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'motif' => $this->motif,
            'statut_traitement' => $this->statut_traitement,
            'auteur' => [
                'id' => $this->auteur->id,
                'name' => $this->auteur->name,
            ],
            'utilisateur_signale' => [
                'id' => $this->utilisateurSignale->id,
                'name' => $this->utilisateurSignale->name,
            ],
            'created_at' => $this->created_at,
        ];
    }
}

<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MessageResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'contenu' => $this->contenu,
            'auteur' => [
                'id' => $this->auteur->id,
                'name' => $this->auteur->name,
            ],
            // Pratique côté frontend pour aligner "mes messages" à droite
            // sans avoir à comparer les ID manuellement partout
            'est_de_moi' => $this->auteur_id === $request->user()->id,
            'created_at' => $this->created_at,
        ];
    }
}

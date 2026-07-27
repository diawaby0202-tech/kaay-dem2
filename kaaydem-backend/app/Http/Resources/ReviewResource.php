<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ReviewResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'note' => $this->note,
            'commentaire' => $this->commentaire,
            'reservation_id' => $this->reservation_id,
            'created_at' => $this->created_at,
        ];
    }
}

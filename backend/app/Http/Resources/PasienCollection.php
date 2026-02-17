<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\ResourceCollection;

class PasienCollection extends ResourceCollection
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'items' => PasienResource::collection($this->collection),
            'total' => method_exists($this->resource, 'total') ? $this->resource->total() : $this->collection->count(),
        ];
    }
}


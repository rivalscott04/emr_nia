<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\ClinicProfile */
class ClinicProfileResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'nama' => $this->nama,
            'telepon' => $this->telepon,
            'alamat' => $this->alamat,
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}

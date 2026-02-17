<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class KunjunganResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'pasien_id' => $this->pasien_id,
            'pasien_nama' => $this->pasien_nama,
            'dokter_id' => $this->dokter_id,
            'dokter_nama' => $this->dokter_nama,
            'poli' => $this->poli,
            'tanggal' => optional($this->tanggal)?->toISOString(),
            'keluhan_utama' => $this->keluhan_utama,
            'status' => $this->status,
            'created_at' => optional($this->created_at)?->toISOString(),
        ];
    }
}


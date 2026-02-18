<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\MasterObatMirror */
class MasterObatMirrorResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'external_noindex' => $this->external_noindex,
            'kode' => $this->kode,
            'nama' => $this->nama,
            'nama_kelompok' => $this->nama_kelompok,
            'kode_satuan' => $this->kode_satuan,
            'harga_jual' => $this->harga_jual,
            'stok' => $this->stok,
            'synced_at' => $this->synced_at?->toIso8601String(),
        ];
    }
}

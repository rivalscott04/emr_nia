<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\ResourceCollection;

class RekamMedisCollection extends ResourceCollection
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $items = $this->collection->map(function ($record): array {
            $diagnosaUtama = $record->diagnosas
                ->where('type', 'ICD-10')
                ->firstWhere('is_utama', true)
                ?? $record->diagnosas->where('type', 'ICD-10')->first();

            return [
                'id' => $record->id,
                'kunjungan_id' => $record->kunjungan_id,
                'tanggal' => optional($record->kunjungan?->tanggal)?->format('Y-m-d'),
                'pasien_nama' => $record->kunjungan?->pasien_nama,
                'no_rm' => $record->kunjungan?->pasien?->no_rm,
                'diagnosa_utama' => $diagnosaUtama ? ($diagnosaUtama->code.' - '.$diagnosaUtama->name) : '-',
                'dokter' => $record->kunjungan?->dokter_nama,
                'status' => $record->status,
            ];
        })->values()->all();

        return [
            'items' => $items,
            'total' => method_exists($this->resource, 'total') ? $this->resource->total() : $this->collection->count(),
        ];
    }
}


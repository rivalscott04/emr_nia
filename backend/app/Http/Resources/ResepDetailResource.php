<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ResepDetailResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $pasien = $this->kunjungan?->pasien;
        $kunjungan = $this->kunjungan;

        return [
            'id' => $this->id,
            'no_resep' => $this->id,
            'kunjungan_id' => $this->kunjungan_id,
            'resep_status' => $this->resep_status,
            'status' => $this->mapStatus($this->resep_status),
            'waktu' => $kunjungan?->tanggal?->format('H:i'),
            'tanggal' => $kunjungan?->tanggal?->format('Y-m-d'),
            'pasien' => [
                'id' => $pasien?->id,
                'nama' => $kunjungan?->pasien_nama ?? $pasien?->nama,
                'no_rm' => $pasien?->no_rm,
                'allergies' => $pasien?->allergies?->pluck('name')->values()->all() ?? [],
            ],
            'dokter' => $kunjungan?->dokter_nama,
            'items' => $this->resepItems->map(fn ($item): array => [
                'id' => $item->id,
                'nama_obat' => $item->nama_obat,
                'jumlah' => $item->jumlah,
                'aturan_pakai' => $item->aturan_pakai,
            ])->values()->all(),
            'farmasi_done_at' => $this->farmasi_done_at?->toISOString(),
            'farmasi_done_by' => $this->farmasiDoneByUser?->name,
        ];
    }

    private function mapStatus(string $resepStatus): string
    {
        return match ($resepStatus) {
            'Sent' => 'Waiting',
            'Processed' => 'Processed',
            'Done' => 'Done',
            default => $resepStatus,
        };
    }
}

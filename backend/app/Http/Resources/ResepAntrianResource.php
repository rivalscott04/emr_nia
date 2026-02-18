<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ResepAntrianResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $kunjungan = $this->kunjungan;
        $waktu = $kunjungan?->tanggal ? $kunjungan->tanggal->format('H:i') : null;

        return [
            'id' => $this->id,
            'no_resep' => $this->id,
            'kunjungan_id' => $this->kunjungan_id,
            'waktu' => $waktu,
            'pasien' => $kunjungan?->pasien_nama ?? $kunjungan?->pasien?->nama,
            'dokter' => $kunjungan?->dokter_nama,
            'status' => $this->mapStatus($this->resep_status),
            'items' => $this->resepItems->map(fn ($item): array => [
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

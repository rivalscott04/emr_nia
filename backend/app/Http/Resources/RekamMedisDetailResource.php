<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RekamMedisDetailResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $pasien = $this->kunjungan?->pasien;
        $age = $pasien?->tanggal_lahir ? $pasien->tanggal_lahir->age.' Tahun' : null;

        return [
            'id' => $this->id,
            'kunjungan_id' => $this->kunjungan_id,
            'status' => $this->status,
            'resep_status' => $this->resep_status,
            'patient' => [
                'id' => $pasien?->id,
                'nama' => $pasien?->nama,
                'umur' => $age,
                'jenis_kelamin' => $pasien?->jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan',
                'no_rm' => $pasien?->no_rm,
                'allergies' => $pasien?->allergies->pluck('name')->values()->all() ?? [],
            ],
            'soap' => [
                'subjective' => $this->subjective ?? '',
                'objective' => $this->objective ?? '',
                'assessment' => $this->assessment ?? '',
                'plan' => $this->plan ?? '',
                'instruksi' => $this->instruksi ?? '',
            ],
            'ttv' => [
                'sistole' => $this->sistole,
                'diastole' => $this->diastole,
                'nadi' => $this->nadi,
                'rr' => $this->rr,
                'suhu' => $this->suhu,
                'spo2' => $this->spo2,
                'berat_badan' => $this->berat_badan,
                'tinggi_badan' => $this->tinggi_badan,
            ],
            'diagnosa' => $this->diagnosas->map(fn ($item): array => [
                'code' => $item->code,
                'name' => $item->name,
                'is_utama' => (bool) $item->is_utama,
            ])->values()->all(),
            'resep' => $this->resepItems->map(fn ($item): array => [
                'id' => $item->id,
                'nama_obat' => $item->nama_obat,
                'jumlah' => $item->jumlah,
                'aturan_pakai' => $item->aturan_pakai,
            ])->values()->all(),
            'addendums' => $this->addendums->map(fn ($item): array => [
                'id' => $item->id,
                'catatan' => $item->catatan,
                'timestamp' => optional($item->timestamp)?->toISOString(),
                'dokter' => $item->dokter,
            ])->values()->all(),
        ];
    }
}


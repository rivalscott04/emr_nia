<?php

namespace App\Http\Resources;

use App\Models\MasterPoli;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class KunjunganResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $supportsObstetri = MasterPoli::query()
            ->where('name', $this->poli)
            ->where('is_active', true)
            ->value('supports_obstetri');

        return [
            'id' => $this->id,
            'pasien_id' => $this->pasien_id,
            'pasien_nama' => $this->pasien_nama,
            'dokter_id' => $this->dokter_id,
            'dokter_nama' => $this->dokter_nama,
            'poli' => $this->poli,
            'kunjungan_ke' => $this->kunjungan_ke !== null ? (int) $this->kunjungan_ke : null,
            'tanggal' => optional($this->tanggal)?->toISOString(),
            'keluhan_utama' => $this->keluhan_utama,
            'td_sistole' => $this->td_sistole,
            'td_diastole' => $this->td_diastole,
            'berat_badan' => $this->berat_badan !== null ? (float) $this->berat_badan : null,
            'tinggi_badan' => $this->tinggi_badan !== null ? (float) $this->tinggi_badan : null,
            'hpht' => optional($this->hpht)?->format('Y-m-d'),
            'gravida' => $this->gravida,
            'para' => $this->para,
            'abortus' => $this->abortus,
            'supports_obstetri' => (bool) $supportsObstetri,
            'status' => $this->status,
            'created_at' => optional($this->created_at)?->toISOString(),
        ];
    }
}


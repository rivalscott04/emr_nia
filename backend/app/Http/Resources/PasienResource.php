<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PasienResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'nik' => $this->nik,
            'no_rm' => $this->no_rm,
            'nama' => $this->nama,
            'tanggal_lahir' => optional($this->tanggal_lahir)?->format('Y-m-d'),
            'jenis_kelamin' => $this->jenis_kelamin,
            'alamat' => $this->alamat,
            'no_hp' => $this->no_hp,
            'golongan_darah' => $this->golongan_darah,
            'pekerjaan' => $this->pekerjaan,
            'status_pernikahan' => $this->status_pernikahan,
            'nama_ibu_kandung' => $this->nama_ibu_kandung,
            'nama_suami' => $this->nama_suami,
            'allergies' => $this->whenLoaded('allergies', function (): array {
                return $this->allergies
                    ->pluck('name')
                    ->values()
                    ->all();
            }, []),
            'created_at' => optional($this->created_at)?->toISOString(),
            'updated_at' => optional($this->updated_at)?->toISOString(),
        ];
    }
}


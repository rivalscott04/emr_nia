<?php

namespace App\Services;

use App\Models\ClinicProfile;

class ClinicProfileService
{
    public function getSingleton(): ClinicProfile
    {
        $row = ClinicProfile::query()->orderBy('id')->first();
        if ($row) {
            return $row;
        }

        return ClinicProfile::query()->create([
            'nama' => null,
            'telepon' => null,
            'alamat' => null,
        ]);
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function update(array $data): ClinicProfile
    {
        $profile = $this->getSingleton();

        $norm = static function (mixed $v): ?string {
            if ($v === null) {
                return null;
            }
            $s = trim((string) $v);

            return $s === '' ? null : $s;
        };

        $profile->fill([
            'nama' => array_key_exists('nama', $data) ? $norm($data['nama']) : $profile->nama,
            'telepon' => array_key_exists('telepon', $data) ? $norm($data['telepon']) : $profile->telepon,
            'alamat' => array_key_exists('alamat', $data) ? $norm($data['alamat']) : $profile->alamat,
        ]);
        $profile->save();

        return $profile->fresh() ?? $profile;
    }
}

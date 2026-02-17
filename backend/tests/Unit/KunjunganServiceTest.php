<?php

namespace Tests\Unit;

use App\Models\Pasien;
use App\Services\KunjunganService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class KunjunganServiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_generate_kunjungan_code_is_incremental(): void
    {
        $pasien = Pasien::query()->create([
            'nik' => '1234567890123111',
            'no_rm' => 'RM-00001',
            'nama' => 'Budi',
            'tanggal_lahir' => '1990-01-01',
            'jenis_kelamin' => 'L',
            'alamat' => 'Alamat',
            'no_hp' => '08123456789',
        ]);

        $service = $this->app->make(KunjunganService::class);

        $first = $service->create([
            'pasien_id' => $pasien->id,
            'dokter_id' => 'D-01',
            'poli' => 'Umum',
            'keluhan_utama' => 'Demam',
        ]);
        $second = $service->create([
            'pasien_id' => $pasien->id,
            'dokter_id' => 'D-02',
            'poli' => 'Gigi',
            'keluhan_utama' => 'Sakit gigi',
        ]);

        $this->assertSame('K-00001', $first->id);
        $this->assertSame('K-00002', $second->id);
    }
}


<?php

namespace Tests\Unit;

use App\Models\Kunjungan;
use App\Models\Pasien;
use App\Services\RekamMedisService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RekamMedisServiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_upsert_draft_creates_single_record_per_kunjungan(): void
    {
        $kunjungan = $this->createKunjungan();
        $service = $this->app->make(RekamMedisService::class);

        $first = $service->upsertDraft($kunjungan->id, [
            'soap' => ['subjective' => 'S1', 'assessment' => 'A1'],
            'ttv' => [],
            'diagnosa' => [['code' => 'I10', 'name' => 'Essential (primary) hypertension']],
            'resep' => [],
        ]);

        $second = $service->upsertDraft($kunjungan->id, [
            'soap' => ['subjective' => 'S2', 'assessment' => 'A2'],
            'ttv' => [],
            'diagnosa' => [['code' => 'J06.9', 'name' => 'Acute upper respiratory infection']],
            'resep' => [],
        ]);

        $this->assertSame($first->id, $second->id);
        $this->assertSame('S2', $second->subjective);
        $this->assertCount(1, $second->diagnosas);
    }

    private function createKunjungan(): Kunjungan
    {
        $pasien = Pasien::query()->create([
            'nik' => '1234567890123999',
            'no_rm' => 'RM-260217-ZZ99',
            'nama' => 'Unit Pasien',
            'tanggal_lahir' => '1991-01-01',
            'jenis_kelamin' => 'L',
            'alamat' => 'Alamat',
            'no_hp' => '08123456789',
        ]);

        return Kunjungan::query()->create([
            'id' => 'K-00999',
            'pasien_id' => $pasien->id,
            'pasien_nama' => $pasien->nama,
            'dokter_id' => 'D-01',
            'dokter_nama' => 'dr. Andi',
            'poli' => 'Umum',
            'tanggal' => now(),
            'keluhan_utama' => 'Keluhan',
            'status' => 'OPEN',
        ]);
    }
}


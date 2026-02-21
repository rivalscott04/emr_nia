<?php

namespace Tests\Feature;

use App\Models\Kunjungan;
use App\Models\Pasien;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class KunjunganApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_create_kunjungan(): void
    {
        $pasien = Pasien::query()->create($this->pasienPayload([
            'nik' => '1234567890123111',
            'no_rm' => '260217-0001',
            'nama' => 'Budi Santoso',
        ]));

        $response = $this->postJson('/api/kunjungan', [
            'pasien_id' => $pasien->id,
            'dokter_id' => 'D-01',
            'poli' => 'Umum',
            'keluhan_utama' => 'Demam dan batuk',
        ]);

        $response->assertCreated()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.id', 'K-00001')
            ->assertJsonPath('data.pasien_nama', 'Budi Santoso')
            ->assertJsonPath('data.dokter_nama', 'dr. Andi')
            ->assertJsonPath('data.status', 'OPEN');
    }

    public function test_create_kunjungan_returns_not_found_for_missing_pasien(): void
    {
        $response = $this->postJson('/api/kunjungan', [
            'pasien_id' => 'missing-id',
            'dokter_id' => 'D-01',
            'poli' => 'Umum',
            'keluhan_utama' => 'Demam',
        ]);

        $response->assertStatus(404)
            ->assertJsonPath('success', false);
    }

    public function test_can_list_and_filter_kunjungan(): void
    {
        $pasien = Pasien::query()->create($this->pasienPayload([
            'nik' => '1234567890123222',
            'no_rm' => '260217-0002',
            'nama' => 'Siti Aminah',
        ]));

        Kunjungan::query()->create([
            'id' => 'K-00001',
            'pasien_id' => $pasien->id,
            'pasien_nama' => 'Siti Aminah',
            'dokter_id' => 'D-01',
            'dokter_nama' => 'dr. Andi',
            'poli' => 'Umum',
            'tanggal' => now()->subDay(),
            'keluhan_utama' => 'Pusing',
            'status' => 'COMPLETED',
        ]);

        Kunjungan::query()->create([
            'id' => 'K-00002',
            'pasien_id' => $pasien->id,
            'pasien_nama' => 'Siti Aminah',
            'dokter_id' => 'D-02',
            'dokter_nama' => 'drg. Siti',
            'poli' => 'Gigi',
            'tanggal' => now(),
            'keluhan_utama' => 'Sakit gigi',
            'status' => 'OPEN',
        ]);

        $response = $this->getJson('/api/kunjungan?status=OPEN&q=Siti');
        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.total', 1)
            ->assertJsonPath('data.items.0.id', 'K-00002');
    }

    public function test_can_update_kunjungan_status(): void
    {
        $pasien = Pasien::query()->create($this->pasienPayload([
            'nik' => '1234567890123333',
            'no_rm' => '260217-0003',
            'nama' => 'Joko',
        ]));

        Kunjungan::query()->create([
            'id' => 'K-00001',
            'pasien_id' => $pasien->id,
            'pasien_nama' => 'Joko',
            'dokter_id' => 'D-01',
            'dokter_nama' => 'dr. Andi',
            'poli' => 'Umum',
            'tanggal' => now(),
            'keluhan_utama' => 'Batuk',
            'status' => 'OPEN',
        ]);

        $response = $this->patchJson('/api/kunjungan/K-00001', [
            'status' => 'COMPLETED',
        ]);

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.status', 'COMPLETED');
    }

    /**
     * @param array<string, mixed> $overrides
     * @return array<string, mixed>
     */
    private function pasienPayload(array $overrides = []): array
    {
        return array_merge([
            'nik' => '1234567890123000',
            'no_rm' => '260217-0099',
            'nama' => 'Test Pasien',
            'tanggal_lahir' => '1990-01-01',
            'jenis_kelamin' => 'L',
            'alamat' => 'Jl. Testing No. 1',
            'no_hp' => '08123456789',
            'golongan_darah' => 'O',
            'pekerjaan' => 'Tester',
            'status_pernikahan' => 'Belum Menikah',
            'nama_ibu_kandung' => 'Ibu Test',
        ], $overrides);
    }
}


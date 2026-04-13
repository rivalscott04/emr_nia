<?php

namespace Tests\Feature;

use App\Models\Kunjungan;
use App\Models\Pasien;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RekamMedisApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_upsert_and_get_rekam_medis_by_kunjungan(): void
    {
        $kunjungan = $this->createKunjungan();

        $payload = [
            'soap' => [
                'subjective' => 'Demam sejak 2 hari',
                'objective' => 'Batuk ringan',
                'assessment' => 'ISPA',
                'plan' => 'Istirahat',
                'instruksi' => 'Kontrol 3 hari lagi',
            ],
            'ttv' => [
                'sistole' => 120,
                'diastole' => 80,
                'nadi' => 88,
                'rr' => 20,
                'suhu' => 37.1,
                'spo2' => 98,
                'berat_badan' => 62,
                'tinggi_badan' => 170,
            ],
            'diagnosa' => [
                ['code' => 'J06.9', 'name' => 'Acute upper respiratory infection', 'is_utama' => true],
            ],
            'resep' => [
                ['nama_obat' => 'Paracetamol', 'jumlah' => '10 tablet', 'aturan_pakai' => '3x1 setelah makan'],
            ],
        ];

        $upsertResponse = $this->putJson("/api/rekam-medis/kunjungan/{$kunjungan->id}", $payload);
        $upsertResponse->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.kunjungan_id', $kunjungan->id)
            ->assertJsonPath('data.status', 'Draft')
            ->assertJsonPath('data.patient.nama', $kunjungan->pasien_nama)
            ->assertJsonPath('data.diagnosa.0.code', 'J06.9');

        $showResponse = $this->getJson("/api/rekam-medis/kunjungan/{$kunjungan->id}");
        $showResponse->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.kunjungan_id', $kunjungan->id)
            ->assertJsonPath('data.resep.0.nama_obat', 'Paracetamol');
    }

    public function test_finalize_requires_subjective_assessment_and_minimum_one_diagnosa(): void
    {
        $kunjungan = $this->createKunjungan();

        $this->putJson("/api/rekam-medis/kunjungan/{$kunjungan->id}", [
            'soap' => [
                'subjective' => '',
                'objective' => 'Obj',
                'assessment' => '',
                'plan' => 'Plan',
                'instruksi' => '',
            ],
            'ttv' => [],
            'diagnosa' => [],
            'resep' => [],
        ])->assertOk();

        $finalizeResponse = $this->postJson("/api/rekam-medis/kunjungan/{$kunjungan->id}/finalize");
        $finalizeResponse->assertStatus(400)
            ->assertJsonPath('success', false);
    }

    public function test_can_finalize_add_addendum_and_send_resep(): void
    {
        $kunjungan = $this->createKunjungan();

        $this->putJson("/api/rekam-medis/kunjungan/{$kunjungan->id}", [
            'soap' => [
                'subjective' => 'Demam',
                'objective' => 'Obj',
                'assessment' => 'Dx',
                'plan' => 'Plan',
                'instruksi' => '',
            ],
            'ttv' => [],
            'diagnosa' => [
                ['code' => 'I10', 'name' => 'Essential (primary) hypertension', 'is_utama' => true],
            ],
            'resep' => [
                ['nama_obat' => 'Amlodipine', 'jumlah' => '10 tablet', 'aturan_pakai' => '1x1'],
            ],
        ])->assertOk();

        $this->postJson("/api/rekam-medis/kunjungan/{$kunjungan->id}/finalize")
            ->assertOk()
            ->assertJsonPath('data.status', 'Final');

        $this->postJson("/api/rekam-medis/kunjungan/{$kunjungan->id}/addendum", [
            'catatan' => 'Tambahan hasil lab',
            'dokter' => 'dr. Adib',
        ])->assertCreated()
            ->assertJsonPath('data.catatan', 'Tambahan hasil lab');

        $this->postJson("/api/rekam-medis/kunjungan/{$kunjungan->id}/resep/send")
            ->assertOk()
            ->assertJsonPath('data.resep_status', 'Sent');
    }

    public function test_list_rekam_medis_returns_items_with_total(): void
    {
        $kunjungan = $this->createKunjungan();

        $this->putJson("/api/rekam-medis/kunjungan/{$kunjungan->id}", [
            'soap' => ['subjective' => 'S', 'objective' => '', 'assessment' => 'A', 'plan' => '', 'instruksi' => ''],
            'ttv' => [],
            'diagnosa' => [
                ['code' => 'I10', 'name' => 'Essential (primary) hypertension', 'is_utama' => true],
            ],
            'resep' => [],
        ])->assertOk();

        $response = $this->getJson('/api/rekam-medis?status=Draft');
        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.total', 1)
            ->assertJsonPath('data.items.0.kunjungan_id', $kunjungan->id);
    }

    private function createKunjungan(): Kunjungan
    {
        $pasien = Pasien::query()->create([
            'nik' => '1234567890123001',
            'no_rm' => '260217-AB12',
            'nama' => 'Budi Santoso',
            'tanggal_lahir' => '1990-01-01',
            'jenis_kelamin' => 'L',
            'alamat' => 'Jl. Merdeka',
            'no_hp' => '08123456789',
        ]);

        return Kunjungan::query()->create([
            'id' => 'K-00001',
            'pasien_id' => $pasien->id,
            'pasien_nama' => $pasien->nama,
            'dokter_id' => 'D-01',
            'dokter_nama' => 'dr. Adib',
            'poli' => 'KIA',
            'tanggal' => now(),
            'keluhan_utama' => 'Demam',
            'status' => 'OPEN',
        ]);
    }
}

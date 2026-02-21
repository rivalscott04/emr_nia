<?php

namespace Tests\Feature;

use App\Models\Pasien;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PasienApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_create_pasien_with_generated_no_rm(): void
    {
        $response = $this->postJson('/api/pasien', $this->storePayload([
            'nik' => '1234567890123456',
        ]));

        $response->assertCreated()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.nik', '1234567890123456')
            ->assertJsonPath('data.allergies', []);

        $generatedNoRm = (string) $response->json('data.no_rm');
        $this->assertMatchesRegularExpression('/^\d{6}-[A-Z0-9]{4}$/', $generatedNoRm);
    }

    public function test_validation_for_nik_and_no_hp_is_applied(): void
    {
        $response = $this->postJson('/api/pasien', $this->storePayload([
            'nik' => '12345abcd',
            'no_hp' => '08123',
        ]));

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['nik', 'no_hp']);
    }

    public function test_can_list_and_search_pasien(): void
    {
        Pasien::query()->create($this->validPayload([
            'nik' => '1234567890123456',
            'no_rm' => 'RM-00001',
            'nama' => 'Budi Santoso',
        ]));

        Pasien::query()->create($this->validPayload([
            'nik' => '1234567890123457',
            'no_rm' => '260217-0002',
            'nama' => 'Siti Aminah',
        ]));

        $listResponse = $this->getJson('/api/pasien?limit=10');
        $listResponse->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.total', 2);

        $searchResponse = $this->getJson('/api/pasien/search?q=Budi');
        $searchResponse->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.total', 1)
            ->assertJsonPath('data.items.0.nama', 'Budi Santoso');
    }

    public function test_can_update_allergies_with_case_insensitive_deduplication(): void
    {
        $pasien = Pasien::query()->create($this->validPayload([
            'nik' => '1234567890123499',
            'no_rm' => '260217-0001',
        ]));

        $response = $this->patchJson("/api/pasien/{$pasien->id}/allergies", [
            'allergies' => ['Amoxicillin', 'amoxicillin', ' Ibuprofen '],
        ]);

        $response->assertOk()
            ->assertJsonPath('success', true);

        $allergies = $response->json('data.allergies');
        $this->assertCount(2, $allergies);
    }

    public function test_show_returns_not_found_when_pasien_is_missing(): void
    {
        $response = $this->getJson('/api/pasien/non-existent-id');

        $response->assertStatus(404)
            ->assertJsonPath('success', false);
    }

    /**
     * @param array<string, mixed> $overrides
     * @return array<string, mixed>
     */
    private function validPayload(array $overrides = []): array
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

    /**
     * @param array<string, mixed> $overrides
     * @return array<string, mixed>
     */
    private function storePayload(array $overrides = []): array
    {
        $payload = $this->validPayload($overrides);
        unset($payload['no_rm']);

        return $payload;
    }
}


<?php

namespace Tests\Unit;

use App\Services\PasienService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PasienServiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_generate_no_rm_has_pattern_and_is_unique_when_creating_pasien(): void
    {
        $service = $this->app->make(PasienService::class);

        $first = $service->createPasien($this->payload('1234567890123111'));
        $second = $service->createPasien($this->payload('1234567890123222'));

        $this->assertMatchesRegularExpression('/^RM-\d{6}-[A-Z0-9]{4}$/', $first->no_rm);
        $this->assertMatchesRegularExpression('/^RM-\d{6}-[A-Z0-9]{4}$/', $second->no_rm);
        $this->assertNotSame($first->no_rm, $second->no_rm);
    }

    /**
     * @return array<string, mixed>
     */
    private function payload(string $nik): array
    {
        return [
            'nik' => $nik,
            'nama' => 'Pasien Unit Test',
            'tanggal_lahir' => '1991-01-01',
            'jenis_kelamin' => 'L',
            'alamat' => 'Jl. Unit Test',
            'no_hp' => '08123456789',
            'golongan_darah' => null,
            'pekerjaan' => null,
            'status_pernikahan' => null,
            'nama_ibu_kandung' => null,
        ];
    }
}


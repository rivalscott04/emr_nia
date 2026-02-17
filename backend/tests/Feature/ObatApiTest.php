<?php

namespace Tests\Feature;

use App\Models\MasterObatMirror;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class ObatApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_search_obat_from_local_mirror(): void
    {
        MasterObatMirror::query()->create([
            'external_noindex' => '1-abc',
            'kode' => 'OB123',
            'nama' => 'Paracetamol 500mg',
            'nama_kelompok' => 'OBAT',
            'kode_satuan' => 'TAB',
            'harga_jual' => 10000,
            'stok' => 15,
            'synced_at' => now(),
        ]);

        $response = $this->getJson('/api/obat/search?q=para&limit=10');

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.total', 1)
            ->assertJsonPath('data.items.0.nama', 'Paracetamol 500mg');
    }

    public function test_can_fallback_to_external_api_when_local_empty(): void
    {
        Config::set('services.farmasi.obat_endpoint', 'https://farmasi.example/api/barang');

        Http::fake([
            'https://farmasi.example/api/barang' => Http::response([
                'status' => 0,
                'message' => 'success',
                'data' => [
                    [
                        'NOINDEX' => '1-xyz',
                        'KODE' => 'OB555',
                        'NAMA' => 'Amoxicillin 500mg',
                        'NAMA_KELOMPOK' => 'OBAT',
                        'KODE_SATUAN' => 'TAB',
                        'HARGA_JUAL' => 25000,
                        'STOK' => 20,
                    ],
                ],
            ], 200),
        ]);

        $response = $this->getJson('/api/obat/search?q=amox');

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.total', 1)
            ->assertJsonPath('data.items.0.kode', 'OB555')
            ->assertJsonPath('data.items.0.nama', 'Amoxicillin 500mg');
    }
}


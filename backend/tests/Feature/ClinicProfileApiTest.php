<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ClinicProfileApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_clinic_profile_is_created_empty_then_updated(): void
    {
        $get = $this->getJson('/api/superadmin/clinic-profile');

        $get->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.nama', null)
            ->assertJsonPath('data.telepon', null)
            ->assertJsonPath('data.alamat', null);

        $put = $this->putJson('/api/superadmin/clinic-profile', [
            'nama' => 'Klinik Contoh',
            'telepon' => '021-1234567',
            'alamat' => 'Jl. Raya No. 1',
        ]);

        $put->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.nama', 'Klinik Contoh')
            ->assertJsonPath('data.telepon', '021-1234567')
            ->assertJsonPath('data.alamat', 'Jl. Raya No. 1');

        $get2 = $this->getJson('/api/superadmin/clinic-profile');
        $get2->assertJsonPath('data.nama', 'Klinik Contoh');
    }

    public function test_clinic_profile_validation_rejects_too_long_nama(): void
    {
        $this->getJson('/api/superadmin/clinic-profile')->assertOk();

        $put = $this->putJson('/api/superadmin/clinic-profile', [
            'nama' => str_repeat('a', 300),
        ]);

        $put->assertStatus(422)->assertJsonValidationErrors(['nama']);
    }
}

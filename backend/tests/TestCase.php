<?php

namespace Tests;

use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    /**
     * User dokter dengan dokter_id & penugasan satu poli (untuk tes yang memanggil KunjunganService::create).
     */
    protected function createDokterForPoli(string $dokterId, string $displayName, string $poli): User
    {
        $role = Role::query()->firstOrCreate(['name' => 'dokter']);

        $user = User::factory()->create([
            'name' => $displayName,
            'dokter_id' => $dokterId,
        ]);
        $user->roles()->syncWithoutDetaching([$role->id]);
        $user->poliAssignments()->create(['poli' => $poli]);

        return $user;
    }
}

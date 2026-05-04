<?php

namespace Database\Seeders;

use App\Models\MasterPoli;
use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $permissions = collect(config('rbac.permissions', []))
            ->mapWithKeys(fn (string $name) => [
                $name => Permission::query()->firstOrCreate(['name' => $name]),
            ]);

        foreach (config('rbac.roles', []) as $roleName => $rolePermissions) {
            $role = Role::query()->firstOrCreate(['name' => $roleName]);
            $role->permissions()->sync(
                collect($rolePermissions)
                    ->map(fn (string $permissionName) => $permissions[$permissionName]?->id)
                    ->filter()
                    ->values()
                    ->all()
            );
        }

        $superadmin = User::query()->updateOrCreate(
            ['email' => 'superadmin@emrnia.local'],
            [
                'name' => 'Super Admin',
                'username' => 'superadmin',
                'password' => Hash::make('password123'),
            ]
        );
        $superadmin->roles()->syncWithoutDetaching(
            Role::query()->where('name', 'superadmin')->pluck('id')->all()
        );

        foreach ([
            [
                'code' => 'OBGYN',
                'name' => 'Obstetri & Ginekologi',
                'supports_obstetri' => true,
            ],
            [
                'code' => 'BEDAH_ONKO',
                'name' => 'Bedah Onkologi',
                'supports_obstetri' => false,
            ],
        ] as $poliSeed) {
            MasterPoli::query()->updateOrCreate(
                ['code' => $poliSeed['code']],
                [
                    'name' => $poliSeed['name'],
                    'is_active' => true,
                    'supports_obstetri' => $poliSeed['supports_obstetri'],
                ]
            );
        }

        $this->call(MasterIcdCodeSeeder::class);
        $this->call(TindakanSeeder::class);

        $dokterRoleIds = Role::query()->where('name', 'dokter')->pluck('id')->all();
        $adminPoliRoleIds = Role::query()->where('name', 'admin_poli')->pluck('id')->all();

        $poliAdminSeeds = [
            [
                'poli' => 'Obstetri & Ginekologi',
                'admin' => [
                    'name' => 'Admin Poli Obstetri & Ginekologi',
                    'username' => 'admin_obgyn',
                    'email' => 'admin.obg@emrnia.id',
                ],
            ],
            [
                'poli' => 'Bedah Onkologi',
                'admin' => [
                    'name' => 'Admin Poli Bedah Onkologi',
                    'username' => 'admin_onko',
                    'email' => 'admin.onko@emrnia.id',
                ],
            ],
        ];

        foreach ($poliAdminSeeds as $seed) {
            $adminPoli = User::query()->updateOrCreate(
                ['email' => $seed['admin']['email']],
                [
                    'name' => $seed['admin']['name'],
                    'username' => $seed['admin']['username'],
                    'password' => Hash::make('password123'),
                ]
            );
            $adminPoli->roles()->syncWithoutDetaching($adminPoliRoleIds);
            $adminPoli->poliAssignments()->updateOrCreate(
                ['poli' => $seed['poli']],
                ['user_id' => $adminPoli->id]
            );
        }

        $dokterAdib = User::query()->updateOrCreate(
            ['email' => 'dr.adib@emrnia.id'],
            [
                'name' => 'dr. Adib Ahmad',
                'username' => 'dokter_adib',
                'dokter_id' => 'D-01',
                'password' => Hash::make('password123'),
            ]
        );
        $dokterAdib->roles()->syncWithoutDetaching($dokterRoleIds);
        $dokterAdib->poliAssignments()->where('poli', '!=', 'Obstetri & Ginekologi')->delete();
        $dokterAdib->poliAssignments()->updateOrCreate(
            ['poli' => 'Obstetri & Ginekologi'],
            ['user_id' => $dokterAdib->id]
        );

        $dokterRamses = User::query()->updateOrCreate(
            ['email' => 'dr.ramses@emrnia.id'],
            [
                'name' => 'dr. Ramses Indriawan',
                'username' => 'dokter_ramses',
                'dokter_id' => 'D-02',
                'password' => Hash::make('password123'),
            ]
        );
        $dokterRamses->roles()->syncWithoutDetaching($dokterRoleIds);
        $dokterRamses->poliAssignments()->where('poli', '!=', 'Bedah Onkologi')->delete();
        $dokterRamses->poliAssignments()->updateOrCreate(
            ['poli' => 'Bedah Onkologi'],
            ['user_id' => $dokterRamses->id]
        );
    }
}

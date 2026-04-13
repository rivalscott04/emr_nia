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
            ['code' => 'UMUM', 'name' => 'Umum'],
            ['code' => 'GIGI', 'name' => 'Gigi'],
            ['code' => 'KIA', 'name' => 'KIA'],
        ] as $poliSeed) {
            MasterPoli::query()->updateOrCreate(
                ['code' => $poliSeed['code']],
                [
                    'name' => $poliSeed['name'],
                    'is_active' => true,
                ]
            );
        }

        $this->call(MasterIcdCodeSeeder::class);
        $this->call(TindakanSeeder::class);

        $dokterRoleIds = Role::query()->where('name', 'dokter')->pluck('id')->all();
        $adminPoliRoleIds = Role::query()->where('name', 'admin_poli')->pluck('id')->all();

        $poliAdminSeeds = [
            [
                'poli' => 'Umum',
                'admin' => [
                    'name' => 'Admin Poli Umum',
                    'username' => 'admin_umum',
                    'email' => 'admin.umum@emrnia.local',
                ],
            ],
            [
                'poli' => 'Gigi',
                'admin' => [
                    'name' => 'Admin Poli Gigi',
                    'username' => 'admin_gigi',
                    'email' => 'admin.gigi@emrnia.local',
                ],
            ],
            [
                'poli' => 'KIA',
                'admin' => [
                    'name' => 'Admin Poli KIA',
                    'username' => 'admin_kia',
                    'email' => 'admin.kia@emrnia.local',
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
            ['email' => 'dr.adib@emrnia.local'],
            [
                'name' => 'dr. Adib',
                'username' => 'dokter_adib',
                'dokter_id' => 'D-01',
                'password' => Hash::make('password123'),
            ]
        );
        $dokterAdib->roles()->syncWithoutDetaching($dokterRoleIds);
        $dokterAdib->poliAssignments()->where('poli', '!=', 'KIA')->delete();
        $dokterAdib->poliAssignments()->updateOrCreate(
            ['poli' => 'KIA'],
            ['user_id' => $dokterAdib->id]
        );
    }
}

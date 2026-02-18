<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Seeder;

/**
 * Sinkronkan permission dan role dari config/rbac.php ke database.
 * Jalankan bila permission role berubah: php artisan db:seed --class=RbacSyncSeeder
 */
class RbacSyncSeeder extends Seeder
{
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

        $this->command?->info('RBAC role & permission berhasil disinkronkan dari config.');
    }
}

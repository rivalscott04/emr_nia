<?php

namespace App\Services;

use App\Models\MasterIcdCode;
use App\Models\MasterPoli;
use App\Models\Role;
use App\Models\User;
use App\Repositories\SuperadminRepository;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use InvalidArgumentException;

class SuperadminService
{
    public function __construct(
        private readonly SuperadminRepository $superadminRepository
    ) {}

    /**
     * @param  array<string, mixed>  $filters
     */
    public function paginateUsers(array $filters, int $limit): LengthAwarePaginator
    {
        return $this->superadminRepository->paginateUsers($filters, $limit);
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    public function createUser(array $payload): User
    {
        return DB::transaction(function () use ($payload): User {
            $roleNames = $payload['role_names'];
            $dokterId = in_array('dokter', $roleNames, true)
                ? $this->generateNextDokterId()
                : null;

            $user = $this->superadminRepository->createUser([
                'name' => $payload['name'],
                'email' => $payload['email'],
                'username' => $payload['username'] ?? null,
                'password' => Hash::make((string) $payload['password']),
                'dokter_id' => $dokterId,
            ]);

            $this->syncUserAccess($user, $roleNames, $payload['poli_scopes'] ?? []);

            return $this->superadminRepository->findUserWithRelationsById((int) $user->id) ?? $user;
        });
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    public function updateUser(int $id, array $payload): User
    {
        return DB::transaction(function () use ($id, $payload): User {
            $user = $this->superadminRepository->findUserWithRelationsById($id);
            if (! $user) {
                throw new ModelNotFoundException('User tidak ditemukan.');
            }

            $user->fill([
                'name' => $payload['name'],
                'email' => $payload['email'],
                'username' => $payload['username'] ?? null,
            ]);

            $roleNames = $payload['role_names'];
            if (in_array('dokter', $roleNames, true)) {
                $existing = trim((string) $user->dokter_id);
                $user->dokter_id = $existing !== '' ? $existing : $this->generateNextDokterId();
            } else {
                $user->dokter_id = null;
            }

            $user->save();

            $this->syncUserAccess($user, $roleNames, $payload['poli_scopes'] ?? []);

            return $this->superadminRepository->findUserWithRelationsById((int) $user->id) ?? $user;
        });
    }

    public function deleteUser(int $id): void
    {
        DB::transaction(function () use ($id): void {
            $user = $this->superadminRepository->findUserWithRelationsById($id);
            if (! $user) {
                throw new ModelNotFoundException('User tidak ditemukan.');
            }

            if ($user->hasRole('superadmin')) {
                $superadminCount = $this->superadminRepository
                    ->paginateUsers(['role' => 'superadmin'], 1)
                    ->total();
                if ($superadminCount <= 1) {
                    throw new InvalidArgumentException('Minimal harus ada satu superadmin aktif.');
                }
            }

            $user->delete();
        });
    }

    /**
     * @return array{roles: list<array<string, mixed>>, available_permissions: list<string>}
     */
    public function getRolesData(): array
    {
        $roles = $this->superadminRepository->getRolesWithPermissions()
            ->map(fn (Role $role) => [
                'id' => $role->id,
                'name' => $role->name,
                'permissions' => $role->permissions->pluck('name')->values()->all(),
            ])
            ->values()
            ->all();

        return [
            'roles' => $roles,
            'available_permissions' => $this->superadminRepository->getPermissionNames(),
        ];
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    public function createRole(array $payload): Role
    {
        return DB::transaction(function () use ($payload): Role {
            $role = $this->superadminRepository->createRole(['name' => $payload['name']]);
            $permissionIds = $this->superadminRepository->getPermissionIdsByNames($payload['permissions']);
            $role->permissions()->sync($permissionIds);

            return $role->fresh('permissions') ?? $role;
        });
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    public function updateRole(int $id, array $payload): Role
    {
        return DB::transaction(function () use ($id, $payload): Role {
            $role = $this->superadminRepository->findRoleById($id);
            if (! $role) {
                throw new ModelNotFoundException('Role tidak ditemukan.');
            }

            $role->name = $payload['name'];
            $role->save();

            $permissionIds = $this->superadminRepository->getPermissionIdsByNames($payload['permissions']);
            $role->permissions()->sync($permissionIds);

            return $role->fresh('permissions') ?? $role;
        });
    }

    public function deleteRole(int $id): void
    {
        DB::transaction(function () use ($id): void {
            $role = $this->superadminRepository->findRoleById($id);
            if (! $role) {
                throw new ModelNotFoundException('Role tidak ditemukan.');
            }

            if (in_array($role->name, ['superadmin', 'admin_poli', 'dokter'], true)) {
                throw new InvalidArgumentException('Role sistem default tidak boleh dihapus.');
            }

            $role->delete();
        });
    }

    /**
     * @return Collection<int, MasterPoli>
     */
    public function getPolis(): Collection
    {
        return $this->superadminRepository->getPolis();
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    public function createPoli(array $payload): MasterPoli
    {
        return $this->superadminRepository->createPoli([
            'code' => $payload['code'],
            'name' => $payload['name'],
            'is_active' => (bool) ($payload['is_active'] ?? true),
            'supports_obstetri' => (bool) ($payload['supports_obstetri'] ?? false),
        ]);
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    public function updatePoli(int $id, array $payload): MasterPoli
    {
        $poli = $this->superadminRepository->findPoliById($id);
        if (! $poli) {
            throw new ModelNotFoundException('Poli tidak ditemukan.');
        }

        $poli->fill([
            'code' => $payload['code'],
            'name' => $payload['name'],
            'is_active' => (bool) ($payload['is_active'] ?? true),
            'supports_obstetri' => (bool) ($payload['supports_obstetri'] ?? false),
        ]);
        $poli->save();

        return $poli;
    }

    public function deletePoli(int $id): void
    {
        $poli = $this->superadminRepository->findPoliById($id);
        if (! $poli) {
            throw new ModelNotFoundException('Poli tidak ditemukan.');
        }

        $poli->delete();
    }

    /**
     * @param  array<string, mixed>  $filters
     */
    public function paginateIcdCodes(array $filters, int $limit): LengthAwarePaginator
    {
        return $this->superadminRepository->paginateIcdCodes($filters, $limit);
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    public function createIcdCode(array $payload): MasterIcdCode
    {
        $existing = $this->superadminRepository->findIcdByTypeAndCode((string) $payload['type'], (string) $payload['code']);
        if ($existing) {
            throw new InvalidArgumentException('Kode ICD untuk tipe ini sudah ada.');
        }

        return $this->superadminRepository->createIcdCode([
            'type' => $payload['type'],
            'code' => $payload['code'],
            'name' => $payload['name'],
            'is_active' => (bool) ($payload['is_active'] ?? true),
        ]);
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    public function updateIcdCode(int $id, array $payload): MasterIcdCode
    {
        $record = $this->superadminRepository->findIcdCodeById($id);
        if (! $record) {
            throw new ModelNotFoundException('Master ICD tidak ditemukan.');
        }

        $existing = $this->superadminRepository->findIcdByTypeAndCode((string) $payload['type'], (string) $payload['code'], $record->id);
        if ($existing) {
            throw new InvalidArgumentException('Kode ICD untuk tipe ini sudah ada.');
        }

        $record->fill([
            'type' => $payload['type'],
            'code' => $payload['code'],
            'name' => $payload['name'],
            'is_active' => (bool) ($payload['is_active'] ?? true),
        ]);
        $record->save();

        return $record;
    }

    public function deleteIcdCode(int $id): void
    {
        $record = $this->superadminRepository->findIcdCodeById($id);
        if (! $record) {
            throw new ModelNotFoundException('Master ICD tidak ditemukan.');
        }

        $record->delete();
    }

    /**
     * @param  list<string>  $roleNames
     * @param  list<string>  $poliScopes
     */
    private function syncUserAccess(User $user, array $roleNames, array $poliScopes): void
    {
        $roleIds = $this->superadminRepository->getRoleIdsByNames($roleNames);
        $user->roles()->sync($roleIds);

        $cleanScopes = collect($poliScopes)
            ->map(fn ($poli) => trim((string) $poli))
            ->filter()
            ->unique()
            ->values();

        $user->poliAssignments()->whereNotIn('poli', $cleanScopes->all())->delete();
        foreach ($cleanScopes as $poli) {
            $user->poliAssignments()->updateOrCreate(['poli' => $poli], ['user_id' => $user->id]);
        }
    }

    /**
     * Kode dokter bisnis (D-01, D-02, …) di-generate server; dipakai di kunjungan & filter, bukan secret.
     */
    private function generateNextDokterId(): string
    {
        $max = 0;
        foreach (User::query()->whereNotNull('dokter_id')->lockForUpdate()->pluck('dokter_id') as $id) {
            if (preg_match('/^D-(\d+)$/i', (string) $id, $matches)) {
                $max = max($max, (int) $matches[1]);
            }
        }

        $next = $max + 1;

        return 'D-'.str_pad((string) $next, 2, '0', STR_PAD_LEFT);
    }
}

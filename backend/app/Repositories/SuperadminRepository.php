<?php

namespace App\Repositories;

use App\Models\MasterIcdCode;
use App\Models\MasterPoli;
use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

class SuperadminRepository
{
    /**
     * @param array<string, mixed> $filters
     */
    public function paginateUsers(array $filters, int $limit): LengthAwarePaginator
    {
        $query = User::query()->with(['roles', 'poliAssignments']);

        if (! empty($filters['q'])) {
            $keyword = (string) $filters['q'];
            $query->where(function ($builder) use ($keyword): void {
                $builder->where('name', 'like', '%'.$keyword.'%')
                    ->orWhere('email', 'like', '%'.$keyword.'%')
                    ->orWhere('username', 'like', '%'.$keyword.'%');
            });
        }

        if (! empty($filters['role'])) {
            $query->whereHas('roles', fn ($roleQuery) => $roleQuery->where('name', (string) $filters['role']));
        }

        if (! empty($filters['poli'])) {
            $query->whereHas('poliAssignments', fn ($poliQuery) => $poliQuery->where('poli', (string) $filters['poli']));
        }

        return $query->orderByDesc('created_at')->paginate($limit);
    }

    public function findUserWithRelationsById(int $id): ?User
    {
        return User::query()->with(['roles', 'poliAssignments'])->find($id);
    }

    public function createUser(array $data): User
    {
        return User::query()->create($data);
    }

    /**
     * @param list<string> $roleNames
     * @return list<int>
     */
    public function getRoleIdsByNames(array $roleNames): array
    {
        return Role::query()->whereIn('name', $roleNames)->pluck('id')->all();
    }

    /**
     * @return Collection<int, Role>
     */
    public function getRolesWithPermissions(): Collection
    {
        return Role::query()->with('permissions')->orderBy('name')->get();
    }

    /**
     * @return list<string>
     */
    public function getPermissionNames(): array
    {
        return Permission::query()->orderBy('name')->pluck('name')->values()->all();
    }

    public function findRoleById(int $id): ?Role
    {
        return Role::query()->find($id);
    }

    public function createRole(array $data): Role
    {
        return Role::query()->create($data);
    }

    /**
     * @param list<string> $permissions
     * @return list<int>
     */
    public function getPermissionIdsByNames(array $permissions): array
    {
        return Permission::query()->whereIn('name', $permissions)->pluck('id')->all();
    }

    /**
     * @return Collection<int, MasterPoli>
     */
    public function getPolis(): Collection
    {
        return MasterPoli::query()->orderBy('name')->get(['id', 'code', 'name', 'is_active']);
    }

    public function createPoli(array $data): MasterPoli
    {
        return MasterPoli::query()->create($data);
    }

    public function findPoliById(int $id): ?MasterPoli
    {
        return MasterPoli::query()->find($id);
    }

    /**
     * @param array<string, mixed> $filters
     */
    public function paginateIcdCodes(array $filters, int $limit): LengthAwarePaginator
    {
        $query = MasterIcdCode::query();

        if (! empty($filters['type'])) {
            $query->where('type', (string) $filters['type']);
        }

        if (array_key_exists('is_active', $filters)) {
            $query->where('is_active', (bool) $filters['is_active']);
        }

        if (! empty($filters['q'])) {
            $keyword = (string) $filters['q'];
            $query->where(function ($builder) use ($keyword): void {
                $builder->where('code', 'like', '%'.$keyword.'%')
                    ->orWhere('name', 'like', '%'.$keyword.'%');
            });
        }

        return $query->orderBy('type')->orderBy('code')->paginate($limit);
    }

    public function findIcdByTypeAndCode(string $type, string $code, ?int $exceptId = null): ?MasterIcdCode
    {
        return MasterIcdCode::query()
            ->where('type', $type)
            ->where('code', $code)
            ->when($exceptId, fn ($query) => $query->where('id', '!=', $exceptId))
            ->first();
    }

    public function createIcdCode(array $data): MasterIcdCode
    {
        return MasterIcdCode::query()->create($data);
    }

    public function findIcdCodeById(int $id): ?MasterIcdCode
    {
        return MasterIcdCode::query()->find($id);
    }
}

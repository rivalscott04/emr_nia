<?php

namespace App\Repositories;

use App\Models\Pasien;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

class PasienRepository
{
    public function paginateWithFilter(?string $query, int $limit): LengthAwarePaginator
    {
        return Pasien::query()
            ->with('allergies')
            ->when($query, function ($builder, $query): void {
                $builder->where(function ($nested) use ($query): void {
                    $nested->where('nama', 'like', '%'.$query.'%')
                        ->orWhere('nik', 'like', '%'.$query.'%')
                        ->orWhere('no_rm', 'like', '%'.$query.'%');
                });
            })
            ->orderByDesc('created_at')
            ->paginate($limit);
    }

    public function findByIdWithAllergies(string $id): ?Pasien
    {
        return Pasien::query()
            ->with('allergies')
            ->where('id', $id)
            ->first();
    }

    /**
     * @return Collection<int, Pasien>
     */
    public function searchLightweight(string $query, int $limit = 20): Collection
    {
        return Pasien::query()
            ->with('allergies')
            ->where(function ($builder) use ($query): void {
                $builder->where('nama', 'like', '%'.$query.'%')
                    ->orWhere('nik', 'like', '%'.$query.'%')
                    ->orWhere('no_rm', 'like', '%'.$query.'%');
            })
            ->orderBy('nama')
            ->limit($limit)
            ->get();
    }

    /**
     * @param array<string, mixed> $data
     */
    public function create(array $data): Pasien
    {
        return Pasien::query()->create($data);
    }

    public function latestNoRm(): ?string
    {
        return Pasien::query()
            ->orderByDesc('no_rm')
            ->value('no_rm');
    }

    public function existsByNoRm(string $noRm): bool
    {
        return Pasien::query()
            ->where('no_rm', $noRm)
            ->exists();
    }
}


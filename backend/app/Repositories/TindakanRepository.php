<?php

namespace App\Repositories;

use App\Models\Tindakan;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class TindakanRepository
{
    /**
     * @param array<string, mixed> $filters
     */
    public function paginate(array $filters, int $limit): LengthAwarePaginator
    {
        $query = Tindakan::query();

        if (! ($filters['include_inactive'] ?? false)) {
            $query->where('is_active', true);
        }

        if (! empty($filters['q'])) {
            $keyword = (string) $filters['q'];
            $query->where(function ($builder) use ($keyword): void {
                $builder->where('kode', 'like', '%'.$keyword.'%')
                    ->orWhere('nama', 'like', '%'.$keyword.'%');
            });
        }

        if (! empty($filters['kategori'])) {
            $query->where('kategori', (string) $filters['kategori']);
        }

        $page = max(1, (int) ($filters['page'] ?? 1));

        return $query->orderBy('kategori')->orderBy('kode')->paginate($limit, ['*'], 'page', $page);
    }

    public function findById(int $id): ?Tindakan
    {
        return Tindakan::query()->find($id);
    }

    public function findByKode(string $kode, ?int $exceptId = null): ?Tindakan
    {
        return Tindakan::query()
            ->where('kode', $kode)
            ->when($exceptId !== null, fn ($q) => $q->where('id', '!=', $exceptId))
            ->first();
    }

    /**
     * @param array<string, mixed> $data
     */
    public function create(array $data): Tindakan
    {
        return Tindakan::query()->create($data);
    }

    /**
     * @return list<string>
     */
    public function getCategories(bool $activeOnly = true): array
    {
        $query = Tindakan::query();
        if ($activeOnly) {
            $query->where('is_active', true);
        }

        return $query->distinct()->pluck('kategori')->sort()->values()->all();
    }
}

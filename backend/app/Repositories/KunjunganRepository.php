<?php

namespace App\Repositories;

use App\Models\Kunjungan;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class KunjunganRepository
{
    /**
     * @param array<string, mixed> $filters
     */
    public function paginateWithFilter(array $filters, int $limit): LengthAwarePaginator
    {
        $query = Kunjungan::query()->with('pasien');

        if (! empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (! empty($filters['tanggal'])) {
            $query->whereDate('tanggal', $filters['tanggal']);
        }

        if (! empty($filters['q'])) {
            $search = $filters['q'];
            $query->where(function ($nested) use ($search): void {
                $nested->where('pasien_nama', 'like', '%'.$search.'%')
                    ->orWhereHas('pasien', function ($pasienQuery) use ($search): void {
                        $pasienQuery->where('no_rm', 'like', '%'.$search.'%');
                    });
            });
        }

        return $query->orderByDesc('created_at')->paginate($limit);
    }

    public function findById(string $id): ?Kunjungan
    {
        return Kunjungan::query()->where('id', $id)->first();
    }

    /**
     * @param array<string, mixed> $data
     */
    public function create(array $data): Kunjungan
    {
        return Kunjungan::query()->create($data);
    }

    public function latestCode(): ?string
    {
        return Kunjungan::query()->orderByDesc('id')->value('id');
    }
}


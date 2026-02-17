<?php

namespace App\Repositories;

use App\Models\MasterObatMirror;
use Illuminate\Database\Eloquent\Collection;

class ObatMirrorRepository
{
    public function countAll(): int
    {
        return MasterObatMirror::query()->count();
    }

    /**
     * @return Collection<int, MasterObatMirror>
     */
    public function search(string $query, int $limit): Collection
    {
        return MasterObatMirror::query()
            ->where(function ($builder) use ($query): void {
                $builder->where('nama', 'like', '%'.$query.'%')
                    ->orWhere('kode', 'like', '%'.$query.'%');
            })
            ->orderByRaw('CASE WHEN nama LIKE ? THEN 0 WHEN kode LIKE ? THEN 1 ELSE 2 END', [$query.'%', $query.'%'])
            ->orderBy('nama')
            ->limit($limit)
            ->get();
    }
}


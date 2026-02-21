<?php

namespace App\Repositories;

use App\Models\Kunjungan;
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

    /**
     * Pasien unik yang pernah dikunjungi oleh dokter ini (untuk export), terurut dari kunjungan terbaru.
     *
     * @return Collection<int, Pasien>
     */
    public function getByDokterIdForExport(string $dokterId, int $limit): Collection
    {
        $pasienIds = Kunjungan::query()
            ->where('dokter_id', $dokterId)
            ->selectRaw('pasien_id, MAX(tanggal) as last_visit')
            ->groupBy('pasien_id')
            ->orderByDesc('last_visit')
            ->limit($limit)
            ->pluck('pasien_id');

        if ($pasienIds->isEmpty()) {
            return new Collection([]);
        }

        $pasiens = Pasien::query()
            ->with('allergies')
            ->whereIn('id', $pasienIds)
            ->get();

        $order = $pasienIds->flip()->all();

        return $pasiens->sortBy(fn (Pasien $p) => $order[$p->id] ?? 999)->values();
    }
}


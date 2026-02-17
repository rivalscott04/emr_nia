<?php

namespace App\Repositories;

use App\Models\RekamMedis;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class RekamMedisRepository
{
    /**
     * @param array<string, mixed> $filters
     */
    public function paginateWithFilters(array $filters, int $limit): LengthAwarePaginator
    {
        $query = RekamMedis::query()->with([
            'kunjungan.pasien',
            'diagnosas',
        ]);

        if (! empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (! empty($filters['tanggal'])) {
            $query->whereHas('kunjungan', function ($builder) use ($filters): void {
                $builder->whereDate('tanggal', $filters['tanggal']);
            });
        }

        if (! empty($filters['pasien_id'])) {
            $query->whereHas('kunjungan', function ($builder) use ($filters): void {
                $builder->where('pasien_id', $filters['pasien_id']);
            });
        }

        if (! empty($filters['dokter_id'])) {
            $query->whereHas('kunjungan', function ($builder) use ($filters): void {
                $builder->where('dokter_id', $filters['dokter_id']);
            });
        }

        return $query->orderByDesc('created_at')->paginate($limit);
    }

    public function findByKunjunganId(string $kunjunganId): ?RekamMedis
    {
        return RekamMedis::query()
            ->with([
                'kunjungan.pasien.allergies',
                'diagnosas',
                'resepItems',
                'addendums',
            ])
            ->where('kunjungan_id', $kunjunganId)
            ->first();
    }

    /**
     * @param array<string, mixed> $data
     */
    public function create(array $data): RekamMedis
    {
        return RekamMedis::query()->create($data);
    }
}


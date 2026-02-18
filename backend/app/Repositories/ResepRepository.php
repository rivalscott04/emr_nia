<?php

namespace App\Repositories;

use App\Models\RekamMedis;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

class ResepRepository
{
    /**
     * Daftar antrian resep (resep_status: Sent, Processed, Done).
     *
     * @param array<string, mixed> $filters
     */
    public function paginateAntrian(array $filters, int $perPage): LengthAwarePaginator
    {
        $query = RekamMedis::query()
            ->with(['kunjungan.pasien', 'kunjungan:id,pasien_nama,dokter_nama,tanggal', 'resepItems', 'farmasiDoneByUser'])
            ->whereIn('resep_status', ['Sent', 'Processed', 'Done']);

        if (! empty($filters['status'])) {
            $query->where('resep_status', $filters['status']);
        }

        if (! empty($filters['tanggal'])) {
            $query->whereHas('kunjungan', function ($q) use ($filters): void {
                $q->whereDate('tanggal', $filters['tanggal']);
            });
        }

        return $query->orderByRaw("CASE WHEN resep_status = 'Sent' THEN 0 WHEN resep_status = 'Processed' THEN 1 ELSE 2 END")
            ->orderByDesc('updated_at')
            ->paginate($perPage);
    }

    /**
     * Riwayat penyerahan (resep_status = Done).
     *
     * @param array<string, mixed> $filters
     */
    public function paginateRiwayat(array $filters, int $perPage): LengthAwarePaginator
    {
        $query = RekamMedis::query()
            ->with(['kunjungan.pasien', 'kunjungan:id,pasien_nama,dokter_nama,tanggal', 'resepItems', 'farmasiDoneByUser'])
            ->where('resep_status', 'Done');

        if (! empty($filters['tanggal'])) {
            $query->whereDate('farmasi_done_at', $filters['tanggal']);
        }

        return $query->orderByDesc('farmasi_done_at')->paginate($perPage);
    }

    public function findForFarmasi(string $id): ?RekamMedis
    {
        return RekamMedis::query()
            ->with([
                'kunjungan.pasien.allergies',
                'kunjungan:id,pasien_id,pasien_nama,dokter_nama,tanggal',
                'resepItems',
                'addendums',
                'farmasiDoneByUser',
            ])
            ->whereIn('resep_status', ['Sent', 'Processed', 'Done'])
            ->find($id);
    }
}

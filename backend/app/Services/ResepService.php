<?php

namespace App\Services;

use App\Models\RekamMedis;
use App\Repositories\ResepRepository;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;

class ResepService
{
    public function __construct(
        private readonly ResepRepository $resepRepository
    ) {}

    /**
     * @param array{status?: string, tanggal?: string, page?: int, limit?: int} $input
     */
    public function getAntrian(array $input): LengthAwarePaginator
    {
        $filters = [];
        if (! empty($input['status']) && in_array($input['status'], ['Sent', 'Processed', 'Done'], true)) {
            $filters['status'] = $input['status'];
        }
        if (! empty($input['tanggal'])) {
            $filters['tanggal'] = $input['tanggal'];
        }
        $perPage = min((int) ($input['limit'] ?? 15), 50);

        return $this->resepRepository->paginateAntrian($filters, $perPage);
    }

    /**
     * @param array{tanggal?: string, page?: int, limit?: int} $input
     */
    public function getRiwayat(array $input): LengthAwarePaginator
    {
        $filters = [];
        if (! empty($input['tanggal'])) {
            $filters['tanggal'] = $input['tanggal'];
        }
        $perPage = min((int) ($input['limit'] ?? 15), 50);

        return $this->resepRepository->paginateRiwayat($filters, $perPage);
    }

    public function getDetail(string $id): RekamMedis
    {
        $rekamMedis = $this->resepRepository->findForFarmasi($id);
        if (! $rekamMedis) {
            throw new InvalidArgumentException('Resep tidak ditemukan.');
        }

        return $rekamMedis;
    }

    /**
     * Update status antrian: Processed atau Done.
     */
    public function updateStatus(string $id, string $status): RekamMedis
    {
        if (! in_array($status, ['Processed', 'Done'], true)) {
            throw new InvalidArgumentException('Status tidak valid. Gunakan Processed atau Done.');
        }

        return DB::transaction(function () use ($id, $status): RekamMedis {
            $rekamMedis = $this->resepRepository->findForFarmasi($id);
            if (! $rekamMedis) {
                throw new InvalidArgumentException('Resep tidak ditemukan.');
            }

            $current = $rekamMedis->resep_status;
            if ($status === 'Processed' && $current !== 'Sent') {
                throw new InvalidArgumentException('Hanya resep dengan status antrian yang dapat diproses.');
            }
            if ($status === 'Done' && ! in_array($current, ['Sent', 'Processed'], true)) {
                throw new InvalidArgumentException('Resep sudah selesai atau status tidak valid.');
            }

            $rekamMedis->resep_status = $status;
            if ($status === 'Done') {
                $rekamMedis->farmasi_done_at = now();
                $rekamMedis->farmasi_done_by = auth('api')->id();
            }
            $rekamMedis->save();

            return $rekamMedis->fresh([
                'kunjungan.pasien.allergies',
                'kunjungan:id,pasien_id,pasien_nama,dokter_nama,tanggal',
                'resepItems',
                'addendums',
                'farmasiDoneByUser',
            ]);
        });
    }
}

<?php

namespace App\Services;

use App\Models\Pasien;
use App\Repositories\PasienRepository;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use RuntimeException;

class PasienService
{
    public function __construct(
        private readonly PasienRepository $pasienRepository
    ) {
    }

    public function listPasien(?string $query, int $limit): LengthAwarePaginator
    {
        return $this->pasienRepository->paginateWithFilter($query, $limit);
    }

    /**
     * @return Collection<int, Pasien>
     */
    public function searchPasien(string $query, int $limit = 20): Collection
    {
        return $this->pasienRepository->searchLightweight($query, $limit);
    }

    /**
     * Pasien unik yang pernah ditangani dokter (untuk export, misal keperluan pajak).
     *
     * @return Collection<int, Pasien>
     */
    public function listPasienForExportByDokter(string $dokterId, int $limit): Collection
    {
        return $this->pasienRepository->getByDokterIdForExport($dokterId, $limit);
    }

    public function getPasienById(string $id): Pasien
    {
        $pasien = $this->pasienRepository->findByIdWithAllergies($id);

        if (! $pasien) {
            throw new ModelNotFoundException('Pasien tidak ditemukan.');
        }

        return $pasien;
    }

    /**
     * @param array<string, mixed> $data
     */
    public function createPasien(array $data): Pasien
    {
        return DB::transaction(function () use ($data): Pasien {
            $data['no_rm'] = $this->generateNoRm();

            $pasien = $this->pasienRepository->create($data);
            $pasien->load('allergies');

            return $pasien;
        });
    }

    /**
     * @param array<int, string> $allergies
     */
    public function updatePasienAllergies(string $id, array $allergies): Pasien
    {
        return DB::transaction(function () use ($id, $allergies): Pasien {
            $pasien = $this->getPasienById($id);

            $normalizedMap = [];

            foreach ($allergies as $allergy) {
                $clean = trim($allergy);

                if ($clean === '') {
                    continue;
                }

                $key = mb_strtolower($clean);
                $normalizedMap[$key] = $clean;
            }

            $normalizedNames = array_keys($normalizedMap);

            $pasien->allergies()
                ->whereNotIn('name_normalized', $normalizedNames)
                ->delete();

            foreach ($normalizedMap as $normalized => $displayName) {
                $pasien->allergies()->updateOrCreate(
                    ['name_normalized' => $normalized],
                    [
                        'name' => $displayName,
                        'pasien_id' => $pasien->id,
                    ]
                );
            }

            $pasien->touch();

            return $pasien->fresh('allergies');
        });
    }

    private function generateNoRm(): string
    {
        for ($attempt = 0; $attempt < 10; $attempt++) {
            $candidate = now()->format('ymd').'-'.Str::upper(Str::random(4));
            if (! $this->pasienRepository->existsByNoRm($candidate)) {
                return $candidate;
            }
        }

        throw new RuntimeException('Gagal menghasilkan nomor rekam medis unik.');
    }
}


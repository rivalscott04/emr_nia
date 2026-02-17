<?php

namespace App\Services;

use App\Models\Kunjungan;
use App\Models\Pasien;
use App\Models\User;
use App\Repositories\KunjunganRepository;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;

class KunjunganService
{
    /**
     * @var array<string, string>
     */
    private array $dokterMaster = [
        'D-01' => 'dr. Andi',
        'D-02' => 'drg. Siti',
    ];

    public function __construct(
        private readonly KunjunganRepository $kunjunganRepository
    ) {
    }

    /**
     * @param array<string, mixed> $filters
     */
    public function listKunjungan(array $filters, int $limit): LengthAwarePaginator
    {
        $this->applyUserScopeToFilters($filters);

        return $this->kunjunganRepository->paginateWithFilter($filters, $limit);
    }

    public function getById(string $id): Kunjungan
    {
        $kunjungan = $this->kunjunganRepository->findById($id);

        if (! $kunjungan) {
            throw new ModelNotFoundException('Kunjungan tidak ditemukan.');
        }

        $this->assertUserCanAccessKunjungan($kunjungan);

        return $kunjungan;
    }

    /**
     * @param array<string, mixed> $payload
     */
    public function create(array $payload): Kunjungan
    {
        return DB::transaction(function () use ($payload): Kunjungan {
            $pasien = Pasien::query()->where('id', $payload['pasien_id'])->first();

            if (! $pasien) {
                throw new ModelNotFoundException('Pasien tidak ditemukan.');
            }

            $dokterName = $this->dokterMaster[$payload['dokter_id']] ?? null;
            if (! $dokterName) {
                throw new InvalidArgumentException('Dokter tidak valid.');
            }

            $this->assertUserCanAccessPoli((string) $payload['poli']);
            $this->assertUserCanUseDokter((string) $payload['dokter_id']);

            $data = [
                'id' => $this->generateKunjunganCode(),
                'pasien_id' => $pasien->id,
                'pasien_nama' => $pasien->nama,
                'dokter_id' => $payload['dokter_id'],
                'dokter_nama' => $dokterName,
                'poli' => $payload['poli'],
                'tanggal' => now(),
                'keluhan_utama' => $payload['keluhan_utama'],
                'status' => 'OPEN',
            ];

            return $this->kunjunganRepository->create($data);
        });
    }

    public function updateStatus(string $id, string $status): Kunjungan
    {
        return DB::transaction(function () use ($id, $status): Kunjungan {
            $kunjungan = $this->getById($id);
            $kunjungan->status = $status;
            $kunjungan->save();

            return $kunjungan->fresh();
        });
    }

    private function generateKunjunganCode(): string
    {
        $latest = $this->kunjunganRepository->latestCode();
        if (! $latest) {
            return 'K-00001';
        }

        $number = (int) str_replace('K-', '', $latest);

        return 'K-'.str_pad((string) ($number + 1), 5, '0', STR_PAD_LEFT);
    }

    /**
     * @param array<string, mixed> $filters
     */
    private function applyUserScopeToFilters(array &$filters): void
    {
        /** @var User|null $user */
        $user = auth('api')->user();
        if (! $user) {
            return;
        }

        if ($user->hasRole('admin_poli')) {
            $filters['scope_polis'] = $user->poliScopes();
        }

        if ($user->hasRole('dokter') && $user->dokter_id) {
            $filters['scope_dokter_id'] = $user->dokter_id;
        }
    }

    private function assertUserCanAccessKunjungan(Kunjungan $kunjungan): void
    {
        /** @var User|null $user */
        $user = auth('api')->user();
        if (! $user || $user->hasRole('superadmin')) {
            return;
        }

        if ($user->hasRole('admin_poli') && ! in_array($kunjungan->poli, $user->poliScopes(), true)) {
            throw new InvalidArgumentException('Anda tidak memiliki akses ke poli ini.');
        }

        if ($user->hasRole('dokter') && $user->dokter_id && $kunjungan->dokter_id !== $user->dokter_id) {
            throw new InvalidArgumentException('Anda tidak memiliki akses ke kunjungan ini.');
        }
    }

    private function assertUserCanAccessPoli(string $poli): void
    {
        /** @var User|null $user */
        $user = auth('api')->user();
        if (! $user || $user->hasRole('superadmin')) {
            return;
        }

        if ($user->hasRole('admin_poli') && ! in_array($poli, $user->poliScopes(), true)) {
            throw new InvalidArgumentException('Anda tidak memiliki akses membuat kunjungan di poli ini.');
        }

        if ($user->hasRole('dokter') && $user->poliScopes() !== [] && ! in_array($poli, $user->poliScopes(), true)) {
            throw new InvalidArgumentException('Anda tidak memiliki akses membuat kunjungan di poli ini.');
        }
    }

    private function assertUserCanUseDokter(string $dokterId): void
    {
        /** @var User|null $user */
        $user = auth('api')->user();
        if (! $user || $user->hasRole('superadmin')) {
            return;
        }

        if ($user->hasRole('dokter') && $user->dokter_id && $user->dokter_id !== $dokterId) {
            throw new InvalidArgumentException('Dokter hanya bisa membuat kunjungan untuk dirinya sendiri.');
        }
    }
}


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
     * Master dokter: id, nama, poli (satu sumber untuk validasi & dropdown).
     *
     * @var list<array{id: string, nama: string, poli: string}>
     */
    private array $dokterMaster = [
        ['id' => 'D-01', 'nama' => 'dr. Andi', 'poli' => 'Umum'],
        ['id' => 'D-02', 'nama' => 'drg. Siti', 'poli' => 'Gigi'],
        ['id' => 'D-03', 'nama' => 'dr. Bima', 'poli' => 'KIA'],
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

        $this->assertUserCanAccessKunjungan($kunjungan, readOnly: true);

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

            $dokter = $this->findDokterById((string) $payload['dokter_id']);
            if (! $dokter) {
                throw new InvalidArgumentException('Dokter tidak valid.');
            }
            $dokterName = $dokter['nama'];

            $this->assertUserCanAccessPoli((string) $payload['poli']);
            $this->assertUserCanUseDokter((string) $payload['dokter_id']);

            $poli = (string) $payload['poli'];
            $kunjunganKe = Kunjungan::query()
                ->where('pasien_id', $pasien->id)
                ->where('poli', $poli)
                ->count() + 1;

            $data = [
                'id' => $this->generateKunjunganCode(),
                'pasien_id' => $pasien->id,
                'pasien_nama' => $pasien->nama,
                'dokter_id' => $payload['dokter_id'],
                'dokter_nama' => $dokterName,
                'poli' => $poli,
                'kunjungan_ke' => $kunjunganKe,
                'tanggal' => now(),
                'keluhan_utama' => $payload['keluhan_utama'],
                'status' => 'OPEN',
            ];

            foreach (['td_sistole', 'td_diastole', 'berat_badan', 'tinggi_badan'] as $key) {
                if (array_key_exists($key, $payload) && $payload[$key] !== null && $payload[$key] !== '') {
                    $data[$key] = $payload[$key];
                }
            }
            foreach (['hpht', 'gravida', 'para', 'abortus'] as $key) {
                if (array_key_exists($key, $payload) && $payload[$key] !== null && $payload[$key] !== '') {
                    $data[$key] = $payload[$key];
                }
            }

            return $this->kunjunganRepository->create($data);
        });
    }

    public function updateStatus(string $id, string $status): Kunjungan
    {
        return $this->updateKunjungan($id, ['status' => $status]);
    }

    /**
     * @param array<string, mixed> $payload Optional: status, td_sistole, td_diastole, berat_badan, tinggi_badan
     */
    public function updateKunjungan(string $id, array $payload): Kunjungan
    {
        return DB::transaction(function () use ($id, $payload): Kunjungan {
            $kunjungan = $this->kunjunganRepository->findById($id);
            if (! $kunjungan) {
                throw new ModelNotFoundException('Kunjungan tidak ditemukan.');
            }
            $this->assertUserCanAccessKunjungan($kunjungan, readOnly: false);

            if (array_key_exists('status', $payload)) {
                $kunjungan->status = (string) $payload['status'];
            }
            foreach (['td_sistole', 'td_diastole', 'berat_badan', 'tinggi_badan', 'gravida', 'para', 'abortus'] as $key) {
                if (array_key_exists($key, $payload)) {
                    $kunjungan->{$key} = $payload[$key] === '' ? null : $payload[$key];
                }
            }
            if (array_key_exists('hpht', $payload)) {
                $kunjungan->hpht = $payload['hpht'] === '' || $payload['hpht'] === null ? null : $payload['hpht'];
            }
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

        // Admin poli & dokter: batas akses per poli (satu poli = data shared antar dokter di poli itu)
        if ($user->hasRole('admin_poli')) {
            $filters['scope_polis'] = $user->poliScopes();
        }

        if ($user->hasRole('dokter') && $user->poliScopes() !== []) {
            $filters['scope_polis'] = $user->poliScopes();
        }
    }

    /**
     * @param bool $readOnly Jika true, user dengan permission read_cross_poli boleh akses kunjungan dari poli lain (untuk rujukan).
     *                      Jika false, akses hanya dalam scope poli sendiri (untuk write).
     */
    private function assertUserCanAccessKunjungan(Kunjungan $kunjungan, bool $readOnly = false): void
    {
        /** @var User|null $user */
        $user = auth('api')->user();
        if (! $user || $user->hasRole('superadmin')) {
            return;
        }

        $inScope = in_array($kunjungan->poli, $user->poliScopes(), true);

        if ($inScope) {
            return;
        }

        // Poli lain: boleh akses hanya read-only dan jika punya permission (rujukan)
        if ($readOnly && $user->hasPermission('kunjungan.read_cross_poli')) {
            return;
        }

        if ($user->hasRole('admin_poli')) {
            throw new InvalidArgumentException('Anda tidak memiliki akses ke poli ini.');
        }

        if ($user->hasRole('dokter')) {
            throw new InvalidArgumentException($readOnly
                ? 'Anda tidak memiliki akses ke kunjungan poli ini. Akses lintas poli memerlukan permission read_cross_poli.'
                : 'Anda tidak memiliki akses ke kunjungan poli ini.');
        }

        throw new InvalidArgumentException('Anda tidak memiliki akses ke kunjungan ini.');
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

    /**
     * @return array{id: string, nama: string, poli: string}|null
     */
    private function findDokterById(string $id): ?array
    {
        foreach ($this->dokterMaster as $d) {
            if ($d['id'] === $id) {
                return $d;
            }
        }

        return null;
    }

    /**
     * Daftar dokter untuk dropdown (nama + poli agar admin tidak bingung jika ada nama sama).
     *
     * @return list<array{id: string, nama: string, poli: string}>
     */
    public function getDokterOptions(): array
    {
        return $this->dokterMaster;
    }
}


<?php

namespace App\Services;

use App\Models\Kunjungan;
use App\Models\RekamMedis;
use App\Models\RekamMedisAddendum;
use App\Models\User;
use App\Repositories\RekamMedisRepository;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use InvalidArgumentException;
use RuntimeException;

class RekamMedisService
{
    public function __construct(
        private readonly RekamMedisRepository $rekamMedisRepository
    ) {
    }

    /**
     * @param array<string, mixed> $filters
     */
    public function list(array $filters, int $limit): LengthAwarePaginator
    {
        $this->applyUserScopeToFilters($filters);

        return $this->rekamMedisRepository->paginateWithFilters($filters, $limit);
    }

    public function getByKunjunganId(string $kunjunganId)
    {
        $kunjungan = Kunjungan::query()->where('id', $kunjunganId)->first();
        if (! $kunjungan) {
            throw new ModelNotFoundException('Kunjungan tidak ditemukan.');
        }

        $this->assertUserCanAccessKunjungan($kunjungan);

        $record = $this->rekamMedisRepository->findByKunjunganId($kunjunganId);
        if (! $record) {
            throw new ModelNotFoundException('Rekam medis belum tersedia untuk kunjungan ini.');
        }

        return $record;
    }

    /**
     * @param array<string, mixed> $payload
     */
    public function upsertDraft(string $kunjunganId, array $payload)
    {
        return DB::transaction(function () use ($kunjunganId, $payload) {
            $kunjungan = Kunjungan::query()->where('id', $kunjunganId)->first();
            if (! $kunjungan) {
                throw new ModelNotFoundException('Kunjungan tidak ditemukan.');
            }

            $this->assertUserCanAccessKunjungan($kunjungan);

            $record = $this->rekamMedisRepository->findByKunjunganId($kunjunganId);
            if ($record && $record->status === 'Final') {
                throw new InvalidArgumentException('Rekam medis sudah Final, data inti tidak dapat diubah.');
            }

            $soap = $payload['soap'] ?? [];
            $ttv = $payload['ttv'] ?? [];

            if (! $record) {
                $record = $this->rekamMedisRepository->create([
                    'id' => $this->generateRekamMedisCode(),
                    'kunjungan_id' => $kunjunganId,
                    'status' => 'Draft',
                    'resep_status' => 'Draft',
                ]);
            }

            $record->fill([
                'subjective' => $soap['subjective'] ?? null,
                'objective' => $soap['objective'] ?? null,
                'assessment' => $soap['assessment'] ?? null,
                'plan' => $soap['plan'] ?? null,
                'instruksi' => $soap['instruksi'] ?? null,
                'sistole' => $ttv['sistole'] ?? null,
                'diastole' => $ttv['diastole'] ?? null,
                'nadi' => $ttv['nadi'] ?? null,
                'rr' => $ttv['rr'] ?? null,
                'suhu' => $ttv['suhu'] ?? null,
                'spo2' => $ttv['spo2'] ?? null,
                'berat_badan' => $ttv['berat_badan'] ?? null,
                'tinggi_badan' => $ttv['tinggi_badan'] ?? null,
            ]);
            $record->save();

            $record->diagnosas()->delete();
            foreach (($payload['diagnosa'] ?? []) as $index => $diagnosa) {
                $record->diagnosas()->create([
                    'id' => (string) Str::uuid(),
                    'code' => $diagnosa['code'],
                    'name' => $diagnosa['name'],
                    'is_utama' => (bool) ($diagnosa['is_utama'] ?? ($index === 0)),
                ]);
            }

            $record->resepItems()->delete();
            foreach (($payload['resep'] ?? []) as $item) {
                $record->resepItems()->create([
                    'id' => (string) Str::uuid(),
                    'nama_obat' => $item['nama_obat'],
                    'jumlah' => $item['jumlah'],
                    'aturan_pakai' => $item['aturan_pakai'],
                ]);
            }

            return $record->fresh([
                'kunjungan.pasien.allergies',
                'diagnosas',
                'resepItems',
                'addendums',
            ]);
        });
    }

    public function finalize(string $kunjunganId)
    {
        return DB::transaction(function () use ($kunjunganId) {
            $record = $this->getByKunjunganId($kunjunganId);

            if (blank($record->subjective) || blank($record->assessment) || $record->diagnosas()->count() === 0) {
                throw new RuntimeException('Finalisasi gagal: Subjective, Assessment, dan minimal 1 diagnosa wajib terisi.');
            }

            $record->status = 'Final';
            $record->save();

            $record->kunjungan()->update(['status' => 'COMPLETED']);

            return $record->fresh([
                'kunjungan.pasien.allergies',
                'diagnosas',
                'resepItems',
                'addendums',
            ]);
        });
    }

    public function addAddendum(string $kunjunganId, string $catatan, ?string $dokter = null): RekamMedisAddendum
    {
        return DB::transaction(function () use ($kunjunganId, $catatan, $dokter): RekamMedisAddendum {
            $record = $this->getByKunjunganId($kunjunganId);
            if ($record->status !== 'Final') {
                throw new InvalidArgumentException('Addendum hanya dapat ditambahkan saat status Final.');
            }

            return $record->addendums()->create([
                'id' => (string) Str::uuid(),
                'catatan' => $catatan,
                'dokter' => $dokter ?: ($record->kunjungan?->dokter_nama ?? 'Dokter'),
                'timestamp' => now(),
            ]);
        });
    }

    public function sendResep(string $kunjunganId)
    {
        return DB::transaction(function () use ($kunjunganId) {
            $record = $this->getByKunjunganId($kunjunganId);
            $record->resep_status = 'Sent';
            $record->save();

            return $record->fresh([
                'kunjungan.pasien.allergies',
                'diagnosas',
                'resepItems',
                'addendums',
            ]);
        });
    }

    private function generateRekamMedisCode(): string
    {
        for ($attempt = 0; $attempt < 10; $attempt++) {
            $candidate = 'RMD-'.now()->format('ymd').'-'.Str::upper(Str::random(4));
            $exists = RekamMedis::query()->where('id', $candidate)->exists();
            if (! $exists) {
                return $candidate;
            }
        }

        throw new RuntimeException('Gagal menghasilkan ID rekam medis unik.');
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
            throw new InvalidArgumentException('Anda tidak memiliki akses ke rekam medis ini.');
        }
    }
}


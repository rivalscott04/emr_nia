<?php

namespace App\Services;

use App\Models\Kunjungan;
use App\Models\RekamMedis;
use App\Models\RekamMedisAddendum;
use App\Models\Tindakan;
use App\Models\User;
use App\Repositories\RekamMedisRepository;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
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

        $this->assertUserCanAccessKunjungan($kunjungan, readOnly: true);

        $record = $this->rekamMedisRepository->findByKunjunganId($kunjunganId);
        if (! $record) {
            throw new ModelNotFoundException('Rekam medis belum tersedia untuk kunjungan ini.');
        }

        return $record;
    }

    /**
     * Rekap tindakan & biaya untuk admin poli (setelah dokter selesai / rekam medis Final).
     * Hanya tersedia bila rekam medis status Final. Tarif diambil dari master Tindakan (by kode).
     *
     * @return array{tindakan: list<array{code: string, name: string, tarif: float}>, total_biaya: float}
     */
    public function getRekapByKunjunganId(string $kunjunganId): array
    {
        $record = $this->getByKunjunganId($kunjunganId);

        if ($record->status !== 'Final') {
            throw new ModelNotFoundException('Rekap tindakan hanya tersedia setelah rekam medis difinalisasi.');
        }

        $tindakanDiagnosas = $record->diagnosas()->where('type', 'ICD-9')->orderBy('code')->get();
        $codes = $tindakanDiagnosas->pluck('code')->unique()->values()->all();

        $masterTindakan = [];
        if ($codes !== []) {
            $tindakanList = Tindakan::query()
                ->whereIn('kode', $codes)
                ->where('is_active', true)
                ->get();
            foreach ($tindakanList as $t) {
                $masterTindakan[$t->kode] = (float) $t->tarif;
            }
        }

        $tindakan = [];
        $totalBiaya = 0.0;
        foreach ($tindakanDiagnosas as $d) {
            $tarif = $masterTindakan[$d->code] ?? 0.0;
            $tindakan[] = [
                'code' => $d->code,
                'name' => $d->name,
                'tarif' => $tarif,
            ];
            $totalBiaya += $tarif;
        }

        return [
            'tindakan' => $tindakan,
            'total_biaya' => $totalBiaya,
        ];
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

            $this->assertUserCanAccessKunjungan($kunjungan, readOnly: false);

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

            if (array_key_exists('lampiran_gambar', $payload)) {
                $this->saveLampiranGambarFile($record, $payload['lampiran_gambar'] ?: null);
            }

            $record->diagnosas()->delete();
            $icd10Index = 0;
            foreach (($payload['diagnosa'] ?? []) as $diagnosa) {
                $type = $diagnosa['type'] ?? 'ICD-10';
                $isUtama = false;
                if ($type === 'ICD-10') {
                    $isUtama = (bool) ($diagnosa['is_utama'] ?? ($icd10Index === 0));
                    $icd10Index++;
                }
                $record->diagnosas()->create([
                    'id' => (string) Str::uuid(),
                    'code' => $diagnosa['code'],
                    'name' => $diagnosa['name'],
                    'type' => $type,
                    'is_utama' => $isUtama,
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

    /**
     * Hapus rekam medis draft (hanya status Draft). Rekam Final tidak boleh dihapus.
     */
    public function deleteDraft(string $kunjunganId): void
    {
        $kunjungan = Kunjungan::query()->where('id', $kunjunganId)->first();
        if (! $kunjungan) {
            throw new ModelNotFoundException('Kunjungan tidak ditemukan.');
        }

        $this->assertUserCanAccessKunjungan($kunjungan, readOnly: false);

        $record = $this->rekamMedisRepository->findByKunjunganId($kunjunganId);
        if (! $record) {
            throw new ModelNotFoundException('Rekam medis tidak ditemukan untuk kunjungan ini.');
        }

        if ($record->status === 'Final') {
            throw new InvalidArgumentException('Rekam medis yang sudah Final tidak dapat dihapus.');
        }

        $record->delete();
    }

    public function finalize(string $kunjunganId)
    {
        return DB::transaction(function () use ($kunjunganId) {
            $record = $this->getByKunjunganId($kunjunganId);
            $this->assertUserCanAccessKunjungan($record->kunjungan, readOnly: false);

            $diagnosaCount = $record->diagnosas()->where('type', 'ICD-10')->count();
            if (blank($record->subjective) || blank($record->assessment) || $diagnosaCount === 0) {
                throw new RuntimeException('Finalisasi gagal: Subjective, Assessment, dan minimal 1 diagnosa (ICD-10) wajib terisi.');
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
            $this->assertUserCanAccessKunjungan($record->kunjungan, readOnly: false);
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
            $this->assertUserCanAccessKunjungan($record->kunjungan, readOnly: false);
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

    /**
     * Simpan atau hapus file lampiran gambar. Payload: base64 data URL (image/png) atau null/string kosong untuk hapus.
     */
    private function saveLampiranGambarFile(RekamMedis $record, ?string $dataUrl): void
    {
        $disk = Storage::disk('local');
        $dir = 'rekam_medis/lampiran';
        $path = $dir.'/'.$record->id.'.png';

        if ($dataUrl === null || $dataUrl === '') {
            if ($record->lampiran_gambar && $disk->exists($record->lampiran_gambar)) {
                $disk->delete($record->lampiran_gambar);
            }
            $record->lampiran_gambar = null;
            $record->save();

            return;
        }

        if (! preg_match('/^data:image\/\w+;base64,/', $dataUrl)) {
            return;
        }

        $dataUrl = preg_replace('/^data:image\/\w+;base64,/', '', $dataUrl);
        $binary = base64_decode($dataUrl, true);
        if ($binary === false) {
            return;
        }

        $disk->makeDirectory($dir);
        $disk->put($path, $binary);
        $record->lampiran_gambar = $path;
        $record->save();
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
        if ($readOnly && $user->hasPermission('rekam_medis.read_cross_poli')) {
            return;
        }

        if ($user->hasRole('admin_poli')) {
            throw new InvalidArgumentException('Anda tidak memiliki akses ke poli ini.');
        }

        if ($user->hasRole('dokter')) {
            throw new InvalidArgumentException($readOnly
                ? 'Anda tidak memiliki akses ke rekam medis poli ini. Akses lintas poli memerlukan permission read_cross_poli.'
                : 'Anda tidak memiliki akses ke rekam medis poli ini.');
        }

        throw new InvalidArgumentException('Anda tidak memiliki akses ke rekam medis ini.');
    }
}


<?php

namespace App\Services;

use App\Models\ObatSyncLog;
use App\Repositories\ObatMirrorRepository;
use Illuminate\Support\Facades\Http;

class ObatSyncService
{
    private const MAX_PAGES = 500;

    public function __construct(
        private readonly ObatMirrorRepository $obatMirrorRepository
    ) {
    }

    /**
     * Jalankan sinkronisasi obat: login ke API (username/password) → ambil token → fetch daftar barang per halaman.
     * Jika username/password tidak diberikan, pakai token dari config (FARMASI_API_TOKEN).
     *
     * @return ObatSyncLog
     */
    public function runSync(?string $username = null, ?string $password = null): ObatSyncLog
    {
        $log = ObatSyncLog::query()->create([
            'started_at' => now(),
            'finished_at' => null,
            'status' => 'running',
            'total_fetched' => 0,
            'total_inserted' => 0,
            'total_updated' => 0,
            'total_skipped' => 0,
            'error_message' => null,
        ]);

        $loginUrl = config('services.farmasi.login_url');
        $companyCode = config('services.farmasi.company_code');
        $barangDaftarUrl = config('services.farmasi.barang_daftar_url');
        $idgudang = config('services.farmasi.idgudang');

        if (! $barangDaftarUrl) {
            $log->update([
                'finished_at' => now(),
                'status' => 'failed',
                'error_message' => 'FARMASI_BARANG_DAFTAR_URL tidak dikonfigurasi.',
            ]);
            return $log->fresh();
        }

        $timeoutMs = (int) config('services.farmasi.timeout_ms', 15000);
        $timeoutSec = max(5, (int) ceil($timeoutMs / 1000));
        $verifySsl = (bool) config('services.farmasi.verify_ssl', true);

        try {
            $token = null;
            if ($username !== null && $username !== '' && $password !== null) {
                if (! $loginUrl || ! $companyCode) {
                    $log->update([
                        'finished_at' => now(),
                        'status' => 'failed',
                        'error_message' => 'Login API tidak dikonfigurasi (FARMASI_LOGIN_URL, FARMASI_COMPANY_CODE).',
                    ]);
                    return $log->fresh();
                }
                $token = $this->login($loginUrl, $companyCode, $username, $password, $timeoutSec, $verifySsl);
                if ($token === null) {
                    $log->update([
                        'finished_at' => now(),
                        'status' => 'failed',
                        'error_message' => 'Login gagal. Periksa username/password atau company-code.',
                    ]);
                    return $log->fresh();
                }
            } else {
                $token = (string) config('services.farmasi.token', '');
                if ($token === '') {
                    $log->update([
                        'finished_at' => now(),
                        'status' => 'failed',
                        'error_message' => 'Masukkan username & password di modal, atau set FARMASI_API_TOKEN di .env.',
                    ]);
                    return $log->fresh();
                }
            }

            $totalFetched = 0;
            $inserted = 0;
            $updated = 0;
            $skipped = 0;
            $halaman = 0;

            while ($halaman < self::MAX_PAGES) {
                $url = $barangDaftarUrl . '?' . http_build_query([
                    'idgudang' => $idgudang,
                    'halaman' => $halaman,
                ]);
                $response = Http::timeout($timeoutSec)
                    ->withOptions(['verify' => $verifySsl])
                    ->withToken($token)
                    ->withHeaders(['company-code' => $companyCode])
                    ->get($url);

                if (! $response->ok()) {
                    $log->update([
                        'finished_at' => now(),
                        'status' => 'failed',
                        'total_fetched' => $totalFetched,
                        'total_inserted' => $inserted,
                        'total_updated' => $updated,
                        'total_skipped' => $skipped,
                        'error_message' => 'Daftar barang halaman ' . $halaman . ' mengembalikan status ' . $response->status(),
                    ]);
                    return $log->fresh();
                }

                $payload = $response->json();
                $rows = $this->extractRowsFromDaftarResponse($payload);
                if (count($rows) === 0) {
                    break;
                }

                foreach ($rows as $row) {
                    if (! is_array($row)) {
                        $skipped++;
                        continue;
                    }
                    $id = (string) ($row['NOINDEX'] ?? $row['id'] ?? $row['kode'] ?? $row['KODE'] ?? '');
                    if ($id === '') {
                        $skipped++;
                        continue;
                    }
                    $existed = $this->obatMirrorRepository->existsByExternalNoindex($id);
                    $this->obatMirrorRepository->upsertFromExternalRow($row);
                    if ($existed) {
                        $updated++;
                    } else {
                        $inserted++;
                    }
                    $totalFetched++;
                }
                $halaman++;
            }

            $log->update([
                'finished_at' => now(),
                'status' => 'success',
                'total_fetched' => $totalFetched,
                'total_inserted' => $inserted,
                'total_updated' => $updated,
                'total_skipped' => $skipped,
                'error_message' => null,
            ]);
        } catch (\Throwable $e) {
            $log->update([
                'finished_at' => now(),
                'status' => 'failed',
                'error_message' => $e->getMessage(),
            ]);
        }

        return $log->fresh();
    }

    /**
     * POST login → ambil token dari response.
     */
    private function login(string $loginUrl, string $companyCode, string $username, string $password, int $timeoutSec, bool $verifySsl = true): ?string
    {
        $response = Http::timeout($timeoutSec)
            ->withOptions(['verify' => $verifySsl])
            ->withHeaders(['company-code' => $companyCode])
            ->acceptJson()
            ->post($loginUrl, [
                'username' => $username,
                'password' => $password,
            ]);

        if (! $response->ok()) {
            return null;
        }

        $body = $response->json();
        if (! is_array($body)) {
            return null;
        }
        // Mizan Cloud: token ada di data.credentials.token
        $token = $body['data']['credentials']['token']
            ?? $body['data']['token']
            ?? $body['data']['access_token']
            ?? $body['token']
            ?? $body['access_token']
            ?? null;
        return $token !== null ? (string) $token : null;
    }

    /**
     * Ambil array item dari response GET daftar barang (beragam format).
     *
     * @param array<string, mixed>|null $payload
     * @return array<int, mixed>
     */
    private function extractRowsFromDaftarResponse(?array $payload): array
    {
        if ($payload === null) {
            return [];
        }
        if (isset($payload['data']) && is_array($payload['data'])) {
            return $payload['data'];
        }
        if (isset($payload['content']) && is_array($payload['content'])) {
            return $payload['content'];
        }
        if (isset($payload['items']) && is_array($payload['items'])) {
            return $payload['items'];
        }
        if (isset($payload['barang']) && is_array($payload['barang'])) {
            return $payload['barang'];
        }
        // Response bisa berupa array langsung (list of items)
        if (array_is_list($payload)) {
            return $payload;
        }
        return [];
    }

    /**
     * @return \Illuminate\Contracts\Pagination\LengthAwarePaginator<ObatSyncLog>
     */
    public function getLogs(int $perPage = 15)
    {
        return ObatSyncLog::query()
            ->orderByDesc('started_at')
            ->paginate($perPage);
    }
}

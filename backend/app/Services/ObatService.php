<?php

namespace App\Services;

use App\Repositories\ObatMirrorRepository;
use Illuminate\Support\Facades\Http;

class ObatService
{
    public function __construct(
        private readonly ObatMirrorRepository $obatMirrorRepository
    ) {
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    public function search(string $query, int $limit): array
    {
        $mirrorCount = $this->obatMirrorRepository->countAll();
        $local = $this->obatMirrorRepository->search($query, $limit);

        if ($mirrorCount > 0 && $local->isNotEmpty()) {
            return $local->map(function ($item): array {
                return [
                    'noindex' => $item->external_noindex,
                    'kode' => $item->kode,
                    'nama' => $item->nama,
                    'nama_kelompok' => $item->nama_kelompok,
                    'kode_satuan' => $item->kode_satuan,
                    'harga_jual' => $item->harga_jual,
                    'stok' => $item->stok,
                ];
            })->values()->all();
        }

        return $this->searchExternal($query, $limit);
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function searchExternal(string $query, int $limit): array
    {
        $endpoint = config('services.farmasi.obat_endpoint');
        if (! $endpoint) {
            return [];
        }

        $timeoutMs = (int) config('services.farmasi.timeout_ms', 5000);
        $token = (string) config('services.farmasi.token', '');

        $request = Http::timeout(max(1, (int) ceil($timeoutMs / 1000)));
        if ($token !== '') {
            $request = $request->withToken($token);
        }

        $response = $request->get($endpoint);
        if (! $response->ok()) {
            return [];
        }

        $payload = $response->json();
        $rows = is_array($payload['data'] ?? null) ? $payload['data'] : [];
        $q = mb_strtolower($query);

        $filtered = collect($rows)
            ->filter(function ($row) use ($q): bool {
                if (! is_array($row)) {
                    return false;
                }
                $nama = mb_strtolower((string) ($row['NAMA'] ?? ''));
                $kode = mb_strtolower((string) ($row['KODE'] ?? ''));

                return str_contains($nama, $q) || str_contains($kode, $q);
            })
            ->take($limit)
            ->map(function ($row): array {
                return [
                    'noindex' => (string) ($row['NOINDEX'] ?? ''),
                    'kode' => (string) ($row['KODE'] ?? ''),
                    'nama' => (string) ($row['NAMA'] ?? ''),
                    'nama_kelompok' => (string) ($row['NAMA_KELOMPOK'] ?? ''),
                    'kode_satuan' => (string) ($row['KODE_SATUAN'] ?? ''),
                    'harga_jual' => is_numeric($row['HARGA_JUAL'] ?? null) ? (float) $row['HARGA_JUAL'] : null,
                    'stok' => is_numeric($row['STOK'] ?? null) ? (float) $row['STOK'] : null,
                ];
            })
            ->values()
            ->all();

        return $filtered;
    }
}


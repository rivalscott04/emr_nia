<?php

namespace App\Repositories;

use App\Models\MasterObatMirror;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

class ObatMirrorRepository
{
    public function countAll(): int
    {
        return MasterObatMirror::query()->count();
    }

    /**
     * Jumlah obat dengan stok di bawah batas (untuk info stok tipis).
     */
    public function countStokDibawah(int $threshold = 30): int
    {
        return MasterObatMirror::query()
            ->whereNotNull('stok')
            ->where('stok', '<', $threshold)
            ->count();
    }

    public function existsByExternalNoindex(string $externalNoindex): bool
    {
        return MasterObatMirror::query()
            ->where('external_noindex', $externalNoindex)
            ->exists();
    }

    private const SORTABLE_COLUMNS = [
        'kode', 'nama', 'nama_kelompok', 'kode_satuan',
        'harga_jual', 'stok', 'synced_at',
    ];

    /**
     * List master obat dengan pagination (untuk halaman Daftar Obat).
     *
     * @param  'asc'|'desc'  $sortOrder
     * @return LengthAwarePaginator<MasterObatMirror>
     */
    public function paginate(
        int $perPage = 20,
        ?string $search = null,
        ?string $sortBy = null,
        ?string $sortOrder = 'asc',
        ?int $stokStrictlyBelow = null
    ): LengthAwarePaginator {
        $orderColumn = $sortBy && in_array($sortBy, self::SORTABLE_COLUMNS, true)
            ? $sortBy
            : 'nama';
        $orderDir = strtolower($sortOrder ?? '') === 'desc' ? 'desc' : 'asc';

        $query = MasterObatMirror::query()->orderBy($orderColumn, $orderDir);

        if ($stokStrictlyBelow !== null) {
            $query->whereNotNull('stok')->where('stok', '<', $stokStrictlyBelow);
        }

        if ($search !== null && trim($search) !== '') {
            $q = '%'.trim($search).'%';
            $query->where(function ($builder) use ($q): void {
                $builder->where('nama', 'like', $q)
                    ->orWhere('kode', 'like', $q)
                    ->orWhere('external_noindex', 'like', $q);
            });
        }

        return $query->paginate($perPage);
    }

    /**
     * @return Collection<int, MasterObatMirror>
     */
    public function search(string $query, int $limit): Collection
    {
        return MasterObatMirror::query()
            ->where(function ($builder) use ($query): void {
                $builder->where('nama', 'like', '%'.$query.'%')
                    ->orWhere('kode', 'like', '%'.$query.'%');
            })
            ->orderByRaw('CASE WHEN nama LIKE ? THEN 0 WHEN kode LIKE ? THEN 1 ELSE 2 END', [$query.'%', $query.'%'])
            ->orderBy('nama')
            ->limit($limit)
            ->get();
    }

    /**
     * Upsert satu row dari API eksternal ke mirror (by external_noindex).
     * Mendukung format lama (NOINDEX, KODE, NAMA) dan format Mizan/umum (id, kode, nama).
     *
     * @param  array<string, mixed>  $row
     */
    public function upsertFromExternalRow(array $row): void
    {
        $noindex = (string) ($row['NOINDEX'] ?? $row['id'] ?? $row['kode'] ?? $row['KODE'] ?? '');
        if ($noindex === '') {
            return;
        }

        $now = now();
        $data = [
            'external_noindex' => $noindex,
            'kode' => (string) ($row['KODE'] ?? $row['kode'] ?? ''),
            'nama' => (string) ($row['NAMA'] ?? $row['nama'] ?? ''),
            'nama_kelompok' => (string) ($row['NAMA_KELOMPOK'] ?? $row['nama_kelompok'] ?? $row['kelompok'] ?? ''),
            'kode_satuan' => (string) ($row['KODE_SATUAN'] ?? $row['kode_satuan'] ?? $row['satuan'] ?? ''),
            'harga_jual' => $this->numericValue($row['HARGA_JUAL'] ?? $row['harga_jual'] ?? $row['harga'] ?? null),
            'stok' => $this->numericValue($row['STOK'] ?? $row['stok'] ?? null),
            'raw_payload' => json_encode($row),
            'synced_at' => $now,
        ];

        MasterObatMirror::query()->updateOrInsert(
            ['external_noindex' => $noindex],
            array_merge($data, ['updated_at' => $now])
        );
    }

    private function numericValue(mixed $v): ?float
    {
        if ($v === null || $v === '') {
            return null;
        }

        return is_numeric($v) ? (float) $v : null;
    }
}

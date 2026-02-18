<?php

namespace App\Services;

use App\Models\Tindakan;
use App\Repositories\TindakanRepository;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use InvalidArgumentException;

class TindakanService
{
    public function __construct(
        private readonly TindakanRepository $tindakanRepository
    ) {
    }

    /**
     * @param array<string, mixed> $filters
     */
    public function list(array $filters, int $limit): LengthAwarePaginator
    {
        return $this->tindakanRepository->paginate($filters, $limit);
    }

    public function getById(int $id): Tindakan
    {
        $tindakan = $this->tindakanRepository->findById($id);
        if (! $tindakan) {
            throw new ModelNotFoundException('Tindakan tidak ditemukan.');
        }

        return $tindakan;
    }

    /**
     * @param array<string, mixed> $payload
     */
    public function create(array $payload): Tindakan
    {
        $existing = $this->tindakanRepository->findByKode((string) $payload['kode']);
        if ($existing) {
            throw new InvalidArgumentException('Kode tindakan sudah ada.');
        }

        $data = [
            'kode' => $payload['kode'],
            'nama' => $payload['nama'],
            'kategori' => $payload['kategori'],
            'tarif' => (float) $payload['tarif'],
            'is_active' => (bool) ($payload['is_active'] ?? true),
        ];

        return $this->tindakanRepository->create($data);
    }

    /**
     * @param array<string, mixed> $payload
     */
    public function update(int $id, array $payload): Tindakan
    {
        $tindakan = $this->tindakanRepository->findById($id);
        if (! $tindakan) {
            throw new ModelNotFoundException('Tindakan tidak ditemukan.');
        }

        if (isset($payload['kode']) && $payload['kode'] !== $tindakan->kode) {
            $existing = $this->tindakanRepository->findByKode((string) $payload['kode'], $id);
            if ($existing) {
                throw new InvalidArgumentException('Kode tindakan sudah dipakai.');
            }
        }

        $fill = [];
        if (array_key_exists('kode', $payload)) {
            $fill['kode'] = (string) $payload['kode'];
        }
        if (array_key_exists('nama', $payload)) {
            $fill['nama'] = (string) $payload['nama'];
        }
        if (array_key_exists('kategori', $payload)) {
            $fill['kategori'] = (string) $payload['kategori'];
        }
        if (array_key_exists('tarif', $payload)) {
            $fill['tarif'] = (float) $payload['tarif'];
        }
        if (array_key_exists('is_active', $payload)) {
            $fill['is_active'] = (bool) $payload['is_active'];
        }
        $tindakan->fill($fill);
        $tindakan->save();

        return $tindakan->fresh() ?? $tindakan;
    }

    public function delete(int $id): void
    {
        $tindakan = $this->tindakanRepository->findById($id);
        if (! $tindakan) {
            throw new ModelNotFoundException('Tindakan tidak ditemukan.');
        }

        $tindakan->delete();
    }

    /**
     * @return list<string>
     */
    public function getCategories(): array
    {
        return $this->tindakanRepository->getCategories(true);
    }
}

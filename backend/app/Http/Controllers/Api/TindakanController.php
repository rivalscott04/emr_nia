<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Tindakan\IndexTindakanRequest;
use App\Http\Requests\Tindakan\StoreTindakanRequest;
use App\Http\Requests\Tindakan\UpdateTindakanRequest;
use App\Services\TindakanService;
use Illuminate\Http\JsonResponse;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use InvalidArgumentException;

class TindakanController extends Controller
{
    public function __construct(
        private readonly TindakanService $tindakanService
    ) {
    }

    /**
     * Daftar tindakan (untuk master page & dropdown rekam medis).
     */
    public function index(IndexTindakanRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $limit = min(100, max(1, (int) ($validated['limit'] ?? 50)));
        $paginator = $this->tindakanService->list($validated, $limit);

        return response()->json([
            'success' => true,
            'message' => '',
            'data' => [
                'data' => $paginator->items(),
                'total' => $paginator->total(),
            ],
        ]);
    }

    /**
     * Detail tindakan by id.
     */
    public function show(int $id): JsonResponse
    {
        try {
            $tindakan = $this->tindakanService->getById($id);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
                'data' => null,
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => '',
            'data' => $tindakan,
        ]);
    }

    /**
     * Tambah tindakan.
     */
    public function store(StoreTindakanRequest $request): JsonResponse
    {
        try {
            $tindakan = $this->tindakanService->create($request->validated());
        } catch (InvalidArgumentException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
                'data' => null,
            ], 400);
        }

        return response()->json([
            'success' => true,
            'message' => 'Tindakan berhasil ditambahkan.',
            'data' => $tindakan,
        ], 201);
    }

    /**
     * Update tindakan.
     */
    public function update(UpdateTindakanRequest $request, int $id): JsonResponse
    {
        try {
            $tindakan = $this->tindakanService->update($id, $request->validated());
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
                'data' => null,
            ], 404);
        } catch (InvalidArgumentException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
                'data' => null,
            ], 400);
        }

        return response()->json([
            'success' => true,
            'message' => 'Tindakan berhasil diperbarui.',
            'data' => $tindakan,
        ]);
    }

    /**
     * Hapus tindakan.
     */
    public function destroy(int $id): JsonResponse
    {
        try {
            $this->tindakanService->delete($id);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
                'data' => null,
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Tindakan berhasil dihapus.',
            'data' => null,
        ]);
    }

    /**
     * Daftar kategori unik (untuk filter dropdown).
     */
    public function categories(): JsonResponse
    {
        $categories = $this->tindakanService->getCategories();

        return response()->json([
            'success' => true,
            'message' => '',
            'data' => $categories,
        ]);
    }
}

<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Kunjungan\IndexKunjunganRequest;
use App\Http\Requests\Kunjungan\StoreKunjunganRequest;
use App\Http\Requests\Kunjungan\UpdateKunjunganStatusRequest;
use App\Http\Resources\KunjunganCollection;
use App\Http\Resources\KunjunganResource;
use App\Services\KunjunganService;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use InvalidArgumentException;

class KunjunganController extends Controller
{
    public function __construct(
        private readonly KunjunganService $kunjunganService
    ) {
    }

    public function index(IndexKunjunganRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $limit = (int) ($validated['limit'] ?? 10);

        $kunjungan = $this->kunjunganService->listKunjungan($validated, $limit);

        return response()->json([
            'success' => true,
            'message' => '',
            'data' => (new KunjunganCollection($kunjungan))->toArray($request),
        ]);
    }

    public function show(string $id): JsonResponse
    {
        try {
            $kunjungan = $this->kunjunganService->getById($id);
        } catch (ModelNotFoundException $exception) {
            return response()->json([
                'success' => false,
                'message' => $exception->getMessage(),
                'data' => null,
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => '',
            'data' => (new KunjunganResource($kunjungan))->toArray(request()),
        ]);
    }

    public function store(StoreKunjunganRequest $request): JsonResponse
    {
        try {
            $kunjungan = $this->kunjunganService->create($request->validated());
        } catch (ModelNotFoundException $exception) {
            return response()->json([
                'success' => false,
                'message' => $exception->getMessage(),
                'data' => null,
            ], 404);
        } catch (InvalidArgumentException $exception) {
            return response()->json([
                'success' => false,
                'message' => $exception->getMessage(),
                'data' => null,
            ], 400);
        }

        return response()->json([
            'success' => true,
            'message' => 'Kunjungan berhasil dibuat.',
            'data' => (new KunjunganResource($kunjungan))->toArray($request),
        ], 201);
    }

    public function update(UpdateKunjunganStatusRequest $request, string $id): JsonResponse
    {
        try {
            $kunjungan = $this->kunjunganService->updateStatus($id, (string) $request->validated('status'));
        } catch (ModelNotFoundException $exception) {
            return response()->json([
                'success' => false,
                'message' => $exception->getMessage(),
                'data' => null,
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Status kunjungan berhasil diperbarui.',
            'data' => (new KunjunganResource($kunjungan))->toArray($request),
        ]);
    }
}


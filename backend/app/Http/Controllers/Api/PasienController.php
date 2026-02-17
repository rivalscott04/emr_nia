<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Pasien\IndexPasienRequest;
use App\Http\Requests\Pasien\StorePasienRequest;
use App\Http\Requests\Pasien\UpdatePasienAllergiesRequest;
use App\Http\Resources\PasienCollection;
use App\Http\Resources\PasienResource;
use App\Services\PasienService;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;

class PasienController extends Controller
{
    public function __construct(
        private readonly PasienService $pasienService
    ) {
    }

    public function index(IndexPasienRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $limit = (int) ($validated['limit'] ?? 10);
        $query = $validated['q'] ?? null;

        $pasiens = $this->pasienService->listPasien($query, $limit);

        return response()->json([
            'success' => true,
            'message' => '',
            'data' => (new PasienCollection($pasiens))->toArray($request),
        ]);
    }

    public function show(string $id): JsonResponse
    {
        try {
            $pasien = $this->pasienService->getPasienById($id);
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
            'data' => (new PasienResource($pasien))->toArray(request()),
        ]);
    }

    public function search(IndexPasienRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $query = trim((string) ($validated['q'] ?? ''));
        $limit = (int) ($validated['limit'] ?? 20);

        if ($query === '') {
            return response()->json([
                'success' => true,
                'message' => '',
                'data' => ['items' => [], 'total' => 0],
            ]);
        }

        $pasiens = $this->pasienService->searchPasien($query, $limit);
        $collection = new PasienCollection($pasiens);

        return response()->json([
            'success' => true,
            'message' => '',
            'data' => $collection->toArray($request),
        ]);
    }

    public function store(StorePasienRequest $request): JsonResponse
    {
        $pasien = $this->pasienService->createPasien($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Pasien berhasil dibuat.',
            'data' => (new PasienResource($pasien))->toArray($request),
        ], 201);
    }

    public function updateAllergies(UpdatePasienAllergiesRequest $request, string $id): JsonResponse
    {
        try {
            $pasien = $this->pasienService->updatePasienAllergies($id, $request->validated('allergies'));
        } catch (ModelNotFoundException $exception) {
            return response()->json([
                'success' => false,
                'message' => $exception->getMessage(),
                'data' => null,
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Alergi pasien berhasil diperbarui.',
            'data' => (new PasienResource($pasien))->toArray($request),
        ]);
    }
}


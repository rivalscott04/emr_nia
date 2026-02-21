<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Kunjungan\IndexKunjunganRequest;
use App\Http\Requests\Kunjungan\StoreKunjunganRequest;
use App\Http\Requests\Kunjungan\UpdateKunjunganRequest;
use App\Http\Resources\KunjunganCollection;
use App\Http\Resources\KunjunganResource;
use App\Models\MasterPoli;
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

    public function dokterOptions(): JsonResponse
    {
        $options = $this->kunjunganService->getDokterOptions();

        return response()->json([
            'success' => true,
            'message' => '',
            'data' => $options,
        ]);
    }

    /**
     * Daftar poli aktif untuk dropdown kunjungan (termasuk flag supports_obstetri).
     */
    public function poliOptions(): JsonResponse
    {
        $polis = MasterPoli::query()
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'code', 'name', 'supports_obstetri']);

        return response()->json([
            'success' => true,
            'message' => '',
            'data' => $polis,
        ]);
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
        } catch (InvalidArgumentException $exception) {
            return response()->json([
                'success' => false,
                'message' => $exception->getMessage(),
                'data' => null,
            ], 403);
        }

        return response()->json([
            'success' => true,
            'message' => '',
            'data' => (new KunjunganResource($kunjungan))->toArray(request()),
        ]);
    }

    public function store(StoreKunjunganRequest $request): JsonResponse
    {
        $user = auth('api')->user();
        if ($user && $user->hasRole('dokter')) {
            return response()->json([
                'success' => false,
                'message' => 'Dokter tidak dapat membuat kunjungan. Kunjungan dibuat oleh admin dan ditujukan ke dokter.',
                'data' => null,
            ], 403);
        }

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
            ], 403);
        }

        return response()->json([
            'success' => true,
            'message' => 'Kunjungan berhasil dibuat.',
            'data' => (new KunjunganResource($kunjungan))->toArray($request),
        ], 201);
    }

    public function update(UpdateKunjunganRequest $request, string $id): JsonResponse
    {
        try {
            $validated = $request->validated();
            $kunjungan = $this->kunjunganService->updateKunjungan($id, $validated);
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
            ], 403);
        }

        return response()->json([
            'success' => true,
            'message' => 'Kunjungan berhasil diperbarui.',
            'data' => (new KunjunganResource($kunjungan))->toArray($request),
        ]);
    }
}


<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\RekamMedis\AddendumRekamMedisRequest;
use App\Http\Requests\RekamMedis\IndexRekamMedisRequest;
use App\Http\Requests\RekamMedis\UpsertRekamMedisRequest;
use App\Http\Resources\RekamMedisCollection;
use App\Http\Resources\RekamMedisDetailResource;
use App\Services\RekamMedisService;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use InvalidArgumentException;
use RuntimeException;

class RekamMedisController extends Controller
{
    public function __construct(
        private readonly RekamMedisService $rekamMedisService
    ) {
    }

    public function index(IndexRekamMedisRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $limit = (int) ($validated['limit'] ?? 10);
        $records = $this->rekamMedisService->list($validated, $limit);

        return response()->json([
            'success' => true,
            'message' => '',
            'data' => (new RekamMedisCollection($records))->toArray($request),
        ]);
    }

    public function showByKunjungan(string $kunjunganId): JsonResponse
    {
        try {
            $record = $this->rekamMedisService->getByKunjunganId($kunjunganId);
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
            'data' => (new RekamMedisDetailResource($record))->toArray(request()),
        ]);
    }

    public function upsertByKunjungan(UpsertRekamMedisRequest $request, string $kunjunganId): JsonResponse
    {
        try {
            $record = $this->rekamMedisService->upsertDraft($kunjunganId, $request->validated());
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
            'message' => 'Rekam medis draft berhasil disimpan.',
            'data' => (new RekamMedisDetailResource($record))->toArray($request),
        ]);
    }

    public function finalizeByKunjungan(string $kunjunganId): JsonResponse
    {
        try {
            $record = $this->rekamMedisService->finalize($kunjunganId);
        } catch (ModelNotFoundException $exception) {
            return response()->json([
                'success' => false,
                'message' => $exception->getMessage(),
                'data' => null,
            ], 404);
        } catch (RuntimeException $exception) {
            return response()->json([
                'success' => false,
                'message' => $exception->getMessage(),
                'data' => null,
            ], 400);
        }

        return response()->json([
            'success' => true,
            'message' => 'Rekam medis berhasil difinalisasi.',
            'data' => (new RekamMedisDetailResource($record))->toArray(request()),
        ]);
    }

    public function addendumByKunjungan(AddendumRekamMedisRequest $request, string $kunjunganId): JsonResponse
    {
        try {
            $addendum = $this->rekamMedisService->addAddendum(
                $kunjunganId,
                (string) $request->validated('catatan'),
                $request->validated('dokter')
            );
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
            'message' => 'Addendum berhasil ditambahkan.',
            'data' => [
                'id' => $addendum->id,
                'catatan' => $addendum->catatan,
                'timestamp' => optional($addendum->timestamp)?->toISOString(),
                'dokter' => $addendum->dokter,
            ],
        ], 201);
    }

    public function sendResepByKunjungan(string $kunjunganId): JsonResponse
    {
        try {
            $record = $this->rekamMedisService->sendResep($kunjunganId);
        } catch (ModelNotFoundException $exception) {
            return response()->json([
                'success' => false,
                'message' => $exception->getMessage(),
                'data' => null,
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Resep berhasil dikirim ke farmasi.',
            'data' => (new RekamMedisDetailResource($record))->toArray(request()),
        ]);
    }
}


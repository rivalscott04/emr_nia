<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Resep\IndexResepAntrianRequest;
use App\Http\Requests\Resep\IndexResepRiwayatRequest;
use App\Http\Requests\Resep\UpdateResepStatusRequest;
use App\Http\Resources\ResepAntrianResource;
use App\Http\Resources\ResepDetailResource;
use App\Services\ResepService;
use Illuminate\Http\JsonResponse;
use InvalidArgumentException;

class ResepController extends Controller
{
    public function __construct(
        private readonly ResepService $resepService
    ) {
    }

    /**
     * Daftar antrian resep (farmasi).
     */
    public function antrian(IndexResepAntrianRequest $request): JsonResponse
    {
        $paginator = $this->resepService->getAntrian($request->validated());

        return response()->json([
            'success' => true,
            'message' => '',
            'data' => [
                'data' => ResepAntrianResource::collection($paginator->items()),
                'total' => $paginator->total(),
            ],
        ]);
    }

    /**
     * Riwayat penyerahan resep (farmasi).
     */
    public function riwayat(IndexResepRiwayatRequest $request): JsonResponse
    {
        $paginator = $this->resepService->getRiwayat($request->validated());

        return response()->json([
            'success' => true,
            'message' => '',
            'data' => [
                'data' => ResepAntrianResource::collection($paginator->items()),
                'total' => $paginator->total(),
            ],
        ]);
    }

    /**
     * Detail satu resep untuk proses/lihat.
     */
    public function show(string $id): JsonResponse
    {
        try {
            $rekamMedis = $this->resepService->getDetail($id);
        } catch (InvalidArgumentException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
                'data' => null,
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => '',
            'data' => new ResepDetailResource($rekamMedis),
        ]);
    }

    /**
     * Update status antrian: Processed atau Done.
     */
    public function update(UpdateResepStatusRequest $request, string $id): JsonResponse
    {
        try {
            $rekamMedis = $this->resepService->updateStatus($id, $request->validated('status'));
        } catch (InvalidArgumentException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
                'data' => null,
            ], 400);
        }

        return response()->json([
            'success' => true,
            'message' => '',
            'data' => new ResepDetailResource($rekamMedis),
        ]);
    }
}

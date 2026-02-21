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
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Storage;
use InvalidArgumentException;
use RuntimeException;
use Symfony\Component\HttpFoundation\StreamedResponse;

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
            'data' => (new RekamMedisDetailResource($record))->toArray(request()),
        ]);
    }

    /**
     * Rekap tindakan & biaya kunjungan (untuk admin poli). Hanya tersedia bila rekam medis status Final.
     */
    public function rekapByKunjungan(string $kunjunganId): JsonResponse
    {
        try {
            $rekap = $this->rekamMedisService->getRekapByKunjunganId($kunjunganId);
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
            'data' => $rekap,
        ]);
    }

    /**
     * Serve file lampiran gambar (untuk ditampilkan / diunduh). Auth: permission rekam_medis.read.
     */
    public function lampiranGambarByKunjungan(string $kunjunganId): JsonResponse|StreamedResponse|Response
    {
        try {
            $record = $this->rekamMedisService->getByKunjunganId($kunjunganId);
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

        if (! $record->lampiran_gambar) {
            return response()->json([
                'success' => false,
                'message' => 'Lampiran gambar tidak ada.',
                'data' => null,
            ], 404);
        }

        $disk = Storage::disk('local');
        if (! $disk->exists($record->lampiran_gambar)) {
            return response()->json([
                'success' => false,
                'message' => 'File lampiran tidak ditemukan.',
                'data' => null,
            ], 404);
        }

        return $disk->response($record->lampiran_gambar, null, [
            'Content-Type' => 'image/png',
            'Content-Disposition' => 'inline; filename="lampiran-pemeriksaan-'.$record->id.'.png"',
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
        } catch (InvalidArgumentException $exception) {
            return response()->json([
                'success' => false,
                'message' => $exception->getMessage(),
                'data' => null,
            ], 403);
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
        } catch (InvalidArgumentException $exception) {
            return response()->json([
                'success' => false,
                'message' => $exception->getMessage(),
                'data' => null,
            ], 403);
        }

        return response()->json([
            'success' => true,
            'message' => 'Resep berhasil dikirim ke farmasi.',
            'data' => (new RekamMedisDetailResource($record))->toArray(request()),
        ]);
    }

    public function destroyByKunjungan(string $kunjunganId): JsonResponse
    {
        try {
            $this->rekamMedisService->deleteDraft($kunjunganId);
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
            'message' => 'Draft rekam medis berhasil dihapus.',
            'data' => null,
        ]);
    }
}


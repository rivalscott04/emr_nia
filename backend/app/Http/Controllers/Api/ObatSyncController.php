<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Superadmin\TriggerObatSyncRequest;
use App\Http\Resources\MasterObatMirrorResource;
use App\Http\Resources\ObatSyncLogResource;
use App\Repositories\ObatMirrorRepository;
use App\Services\ObatSyncService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ObatSyncController extends Controller
{
    public function __construct(
        private readonly ObatSyncService $obatSyncService,
        private readonly ObatMirrorRepository $obatMirrorRepository
    ) {}

    /**
     * Daftar master obat (hasil sync) untuk halaman Daftar Obat – paginated.
     */
    public function indexMasterObat(Request $request): JsonResponse
    {
        $perPage = min(50, max(10, (int) $request->get('per_page', 20)));
        $search = $request->get('search');
        $sortBy = $request->get('sort_by');
        $sortOrder = $request->get('sort_order', 'asc');
        $stokTipis = $request->boolean('stok_tipis');
        $stokStrictlyBelow = $stokTipis ? 30 : null;

        $paginator = $this->obatMirrorRepository->paginate($perPage, $search, $sortBy, $sortOrder, $stokStrictlyBelow);

        return response()->json([
            'success' => true,
            'message' => '',
            'data' => [
                'items' => MasterObatMirrorResource::collection($paginator->items()),
                'total' => $paginator->total(),
                'current_page' => $paginator->currentPage(),
                'per_page' => $paginator->perPage(),
                'summary' => [
                    'total_obat' => $this->obatMirrorRepository->countAll(),
                    'stok_dibawah_30' => $this->obatMirrorRepository->countStokDibawah(30),
                ],
            ],
        ]);
    }

    /**
     * Daftar riwayat sync obat (paginated).
     */
    public function index(): JsonResponse
    {
        $logs = $this->obatSyncService->getLogs(20);

        return response()->json([
            'success' => true,
            'message' => '',
            'data' => [
                'items' => ObatSyncLogResource::collection($logs->items()),
                'total' => $logs->total(),
                'current_page' => $logs->currentPage(),
                'per_page' => $logs->perPage(),
            ],
        ]);
    }

    /**
     * Trigger sync obat. Body opsional: username, password untuk Basic Auth ke API eksternal.
     */
    public function store(TriggerObatSyncRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $username = isset($validated['username']) ? (string) $validated['username'] : null;
        $password = isset($validated['password']) ? (string) $validated['password'] : null;

        $log = $this->obatSyncService->runSync($username, $password);

        return response()->json([
            'success' => true,
            'message' => $log->status === 'success'
                ? 'Sync obat selesai.'
                : ($log->status === 'failed' ? 'Sync gagal: '.($log->error_message ?? 'Unknown error') : 'Sync sedang berjalan.'),
            'data' => new ObatSyncLogResource($log),
        ]);
    }
}

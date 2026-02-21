<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Pasien\ExportPasienRequest;
use App\Http\Requests\Pasien\IndexPasienRequest;
use App\Http\Requests\Pasien\StorePasienRequest;
use App\Http\Requests\Pasien\UpdatePasienAllergiesRequest;
use App\Http\Resources\PasienCollection;
use App\Http\Resources\PasienResource;
use App\Services\PasienService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

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

    /**
     * Export daftar pasien yang pernah ditangani dokter (untuk keperluan pajak dll).
     * Hanya untuk role dokter dengan dokter_id terisi. Format: csv atau pdf. Isi menyertakan nama dokter.
     */
    public function export(ExportPasienRequest $request): StreamedResponse|Response
    {
        $user = $request->user();
        $dokterId = (string) $user->dokter_id;
        $dokterName = $user->name ?? 'Dokter';
        $limit = (int) $request->validated('limit');
        $format = (string) $request->validated('format');

        $pasiens = $this->pasienService->listPasienForExportByDokter($dokterId, $limit);
        $timestamp = now()->format('Y-m-d-His');

        if ($format === 'pdf') {
            $rows = $pasiens->map(fn ($p) => [
                'no_rm' => $p->no_rm ?? '',
                'nik' => $p->nik ?? '',
                'nama' => $p->nama ?? '',
                'tanggal_lahir' => $p->tanggal_lahir?->format('Y-m-d') ?? '',
                'jenis_kelamin' => $p->jenis_kelamin ?? '',
                'alamat' => $p->alamat ?? '',
                'no_hp' => $p->no_hp ?? '',
                'golongan_darah' => $p->golongan_darah ?? '',
                'pekerjaan' => $p->pekerjaan ?? '',
                'status_pernikahan' => $p->status_pernikahan ?? '',
                'nama_ibu_kandung' => $p->nama_ibu_kandung ?? '',
                'nama_suami' => $p->nama_suami ?? '',
                'alergi' => $p->allergies->pluck('name')->join('; ') ?? '',
            ])->all();

            $pdf = Pdf::loadView('pdf.export-pasien', [
                'dokterName' => $dokterName,
                'tanggalExport' => now()->translatedFormat('d F Y H:i'),
                'pasiens' => $rows,
            ])->setPaper('a4', 'landscape');

            $filename = 'export-pasien-'.$timestamp.'.pdf';
            return $pdf->download($filename);
        }

        $filename = 'export-pasien-'.$timestamp.'.csv';
        return response()->streamDownload(
            function () use ($pasiens, $dokterName): void {
                $handle = fopen('php://output', 'w');
                if ($handle === false) {
                    return;
                }

                $header = [
                    'Nama Dokter',
                    'No RM',
                    'NIK',
                    'Nama',
                    'Tanggal Lahir',
                    'Jenis Kelamin',
                    'Alamat',
                    'No HP',
                    'Golongan Darah',
                    'Pekerjaan',
                    'Status Pernikahan',
                    'Nama Ibu Kandung',
                    'Nama Suami',
                    'Alergi',
                ];
                fputcsv($handle, $header);

                foreach ($pasiens as $pasien) {
                    fputcsv($handle, [
                        $dokterName,
                        $pasien->no_rm ?? '',
                        $pasien->nik ?? '',
                        $pasien->nama ?? '',
                        $pasien->tanggal_lahir?->format('Y-m-d') ?? '',
                        $pasien->jenis_kelamin ?? '',
                        $pasien->alamat ?? '',
                        $pasien->no_hp ?? '',
                        $pasien->golongan_darah ?? '',
                        $pasien->pekerjaan ?? '',
                        $pasien->status_pernikahan ?? '',
                        $pasien->nama_ibu_kandung ?? '',
                        $pasien->nama_suami ?? '',
                        $pasien->allergies->pluck('name')->join('; ') ?? '',
                    ]);
                }

                fclose($handle);
            },
            $filename,
            [
                'Content-Type' => 'text/csv; charset=UTF-8',
                'Content-Disposition' => 'attachment; filename="'.$filename.'"',
            ]
        );
    }
}


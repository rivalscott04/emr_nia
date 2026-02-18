<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Kunjungan;
use App\Models\RekamMedis;
use App\Models\RekamMedisDiagnosa;
use App\Models\RekamMedisResepItem;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function summary(): JsonResponse
    {
        /** @var User|null $user */
        $user = auth('api')->user();

        $today = Carbon::today();
        $yesterday = Carbon::yesterday();

        $todayStart = $today->clone()->startOfDay();
        $todayEnd = $today->clone()->endOfDay();
        $yesterdayStart = $yesterday->clone()->startOfDay();
        $yesterdayEnd = $yesterday->clone()->endOfDay();

        // Base scoped query for kunjungan
        $kunjunganBaseQuery = Kunjungan::query();
        $this->applyUserScope($kunjunganBaseQuery, $user);

        $kunjunganTodayQuery = (clone $kunjunganBaseQuery)
            ->whereBetween('tanggal', [$todayStart, $todayEnd]);

        $kunjunganYesterdayQuery = (clone $kunjunganBaseQuery)
            ->whereBetween('tanggal', [$yesterdayStart, $yesterdayEnd]);

        $totalKunjunganToday = $kunjunganTodayQuery->count();
        $totalKunjunganYesterday = $kunjunganYesterdayQuery->count();

        $weekStart = Carbon::now()->subDays(6)->startOfDay();
        $totalKunjunganMingguIni = (clone $kunjunganBaseQuery)
            ->whereBetween('tanggal', [$weekStart, $todayEnd])
            ->count();

        $totalPasienHariIni = (clone $kunjunganTodayQuery)
            ->distinct('pasien_id')
            ->count('pasien_id');

        // Resep stats are derived from rekam medis + kunjungan
        $rekamMedisBaseQuery = RekamMedis::query()
            ->join('kunjungans', 'rekam_medis.kunjungan_id', '=', 'kunjungans.id');
        $this->applyUserScope($rekamMedisBaseQuery, $user, 'kunjungans');

        $resepKeluar = (clone $rekamMedisBaseQuery)
            ->where('rekam_medis.resep_status', 'Sent')
            ->whereBetween('kunjungans.tanggal', [$todayStart, $todayEnd])
            ->count('rekam_medis.id');

        // Saat ini belum ada status dispensing terpisah, jadi kita kembalikan 0 yang eksplisit.
        $resepTebusCount = 0;

        // Modul tindakan transaksi belum diimplementasikan, sementara kembalikan 0.
        $tindakanMedis = 0;

        // Top diagnosa dan obat dalam 30 hari terakhir (lebih informatif daripada hanya hari ini)
        $rangeStart = Carbon::now()->subDays(30)->startOfDay();
        $rangeEnd = $todayEnd;

        $topDiagnosaQuery = RekamMedisDiagnosa::query()
            ->select('rekam_medis_diagnosas.code', 'rekam_medis_diagnosas.name', DB::raw('COUNT(*) as total'))
            ->join('rekam_medis', 'rekam_medis_diagnosas.rekam_medis_id', '=', 'rekam_medis.id')
            ->join('kunjungans', 'rekam_medis.kunjungan_id', '=', 'kunjungans.id')
            ->whereBetween('kunjungans.tanggal', [$rangeStart, $rangeEnd]);
        $this->applyUserScope($topDiagnosaQuery, $user, 'kunjungans');

        $topDiagnosa = $topDiagnosaQuery
            ->groupBy('rekam_medis_diagnosas.code', 'rekam_medis_diagnosas.name')
            ->orderByDesc('total')
            ->limit(5)
            ->get()
            ->map(static function ($row): array {
                return [
                    'code' => $row->code,
                    'name' => $row->name,
                    'count' => (int) $row->total,
                ];
            })
            ->values();

        $topObatQuery = RekamMedisResepItem::query()
            ->select('rekam_medis_resep_items.nama_obat', DB::raw('COUNT(*) as total'))
            ->join('rekam_medis', 'rekam_medis_resep_items.rekam_medis_id', '=', 'rekam_medis.id')
            ->join('kunjungans', 'rekam_medis.kunjungan_id', '=', 'kunjungans.id')
            ->whereBetween('kunjungans.tanggal', [$rangeStart, $rangeEnd]);
        $this->applyUserScope($topObatQuery, $user, 'kunjungans');

        $topObat = $topObatQuery
            ->groupBy('rekam_medis_resep_items.nama_obat')
            ->orderByDesc('total')
            ->limit(5)
            ->get()
            ->map(static function ($row): array {
                return [
                    'name' => $row->nama_obat,
                    'count' => (int) $row->total,
                ];
            })
            ->values();

        return response()->json([
            'success' => true,
            'message' => '',
            'data' => [
                'stats' => [
                    'total_pasien_hari_ini' => $totalPasienHariIni,
                    'total_kunjungan' => $totalKunjunganToday,
                    'total_kunjungan_kemarin' => $totalKunjunganYesterday,
                    'total_kunjungan_minggu_ini' => $totalKunjunganMingguIni,
                    'resep_keluar' => $resepKeluar,
                    'resep_tebus_count' => $resepTebusCount,
                    'tindakan_medis' => $tindakanMedis,
                ],
                'top_diagnosa' => $topDiagnosa,
                'top_obat' => $topObat,
            ],
        ]);
    }

    /**
     * Terapkan scope user (dokter/admin poli) ke query berbasis kunjungan.
     *
     * @param Builder $query
     * @param User|null $user
     * @param string $kunjunganTableAlias
     */
    private function applyUserScope(Builder $query, ?User $user, string $kunjunganTableAlias = 'kunjungans'): void
    {
        if (! $user || $user->hasRole('superadmin')) {
            return;
        }

        if ($user->hasRole('admin_poli')) {
            $poliScopes = $user->poliScopes();
            if ($poliScopes !== []) {
                $query->whereIn($kunjunganTableAlias.'.poli', $poliScopes);
            }
        }

        if ($user->hasRole('dokter') && $user->dokter_id) {
            $query->where($kunjunganTableAlias.'.dokter_id', $user->dokter_id);
        }
    }
}


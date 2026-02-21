<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\AuditLogController;
use App\Http\Controllers\Api\IcdController;
use App\Http\Controllers\Api\KunjunganController;
use App\Http\Controllers\Api\ObatController;
use App\Http\Controllers\Api\PasienController;
use App\Http\Controllers\Api\RekamMedisController;
use App\Http\Controllers\Api\SuperadminController;
use App\Http\Controllers\Api\ObatSyncController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\TindakanController;
use App\Http\Controllers\Api\ResepController;
use Illuminate\Support\Facades\Route;


use App\Http\Controllers\Api\NotificationController;

Route::prefix('auth')->group(function (): void {
    Route::post('/login', [AuthController::class, 'login']);

    Route::middleware('auth:api')->group(function (): void {
        Route::get('/me', [AuthController::class, 'me']);
        Route::post('/logout', [AuthController::class, 'logout']);
        
        // Notifications
        Route::get('/notifications', [NotificationController::class, 'index']);
        Route::get('/notifications/unread-count', [NotificationController::class, 'unreadCount']);
        Route::patch('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
        Route::patch('/notifications/read-all', [NotificationController::class, 'markAllAsRead']);
    });
});

$apiProtectionMiddleware = app()->environment('testing')
    ? ['audit.api']
    : ['auth:api', 'audit.api'];

Route::middleware($apiProtectionMiddleware)->group(function (): void {
    Route::prefix('dashboard')->group(function (): void {
        Route::get('/summary', [DashboardController::class, 'summary'])->middleware('permission:dashboard.view');
    });

    Route::prefix('pasien')->group(function (): void {
        Route::get('/', [PasienController::class, 'index'])->middleware('permission:pasien.read');
        Route::get('/search', [PasienController::class, 'search'])->middleware('permission:pasien.read');
        Route::get('/export', [PasienController::class, 'export'])->middleware('permission:pasien.read');
        Route::get('/{id}', [PasienController::class, 'show'])->middleware('permission:pasien.read');
        Route::post('/', [PasienController::class, 'store'])->middleware('permission:pasien.write');
        Route::patch('/{id}/allergies', [PasienController::class, 'updateAllergies'])->middleware('permission:pasien.write');
    });

    Route::prefix('kunjungan')->group(function (): void {
        Route::get('/', [KunjunganController::class, 'index'])->middleware('permission:kunjungan.read');
        Route::get('/dokter-options', [KunjunganController::class, 'dokterOptions'])->middleware('permission:kunjungan.read');
        Route::get('/poli-options', [KunjunganController::class, 'poliOptions'])->middleware('permission:kunjungan.read');
        Route::get('/{id}', [KunjunganController::class, 'show'])->middleware('permission:kunjungan.read');
        Route::post('/', [KunjunganController::class, 'store'])->middleware('permission:kunjungan.write');
        Route::patch('/{id}', [KunjunganController::class, 'update'])->middleware('permission:kunjungan.write');
    });

    Route::prefix('rekam-medis')->group(function (): void {
        Route::get('/', [RekamMedisController::class, 'index'])->middleware('permission:rekam_medis.read');
        Route::get('/kunjungan/{kunjunganId}', [RekamMedisController::class, 'showByKunjungan'])->middleware('permission:rekam_medis.read');
        Route::get('/kunjungan/{kunjunganId}/rekap', [RekamMedisController::class, 'rekapByKunjungan'])->middleware('permission_any:rekam_medis.read,rekap_tindakan.read');
        Route::get('/kunjungan/{kunjunganId}/lampiran-gambar', [RekamMedisController::class, 'lampiranGambarByKunjungan'])->middleware('permission:rekam_medis.read');
        Route::put('/kunjungan/{kunjunganId}', [RekamMedisController::class, 'upsertByKunjungan'])->middleware('permission:rekam_medis.write');
        Route::post('/kunjungan/{kunjunganId}/finalize', [RekamMedisController::class, 'finalizeByKunjungan'])->middleware('permission:rekam_medis.write');
        Route::post('/kunjungan/{kunjunganId}/addendum', [RekamMedisController::class, 'addendumByKunjungan'])->middleware('permission:rekam_medis.write');
        Route::post('/kunjungan/{kunjunganId}/resep/send', [RekamMedisController::class, 'sendResepByKunjungan'])->middleware('permission:rekam_medis.write');
        Route::delete('/kunjungan/{kunjunganId}', [RekamMedisController::class, 'destroyByKunjungan'])->middleware('permission:rekam_medis.write');
    });

    Route::prefix('obat')->group(function (): void {
        Route::get('/search', [ObatController::class, 'search'])->middleware('permission:rekam_medis.read');
    });

    Route::prefix('icd')->group(function (): void {
        Route::get('/search', [IcdController::class, 'search'])->middleware('permission:rekam_medis.read');
    });

    Route::prefix('tindakan')->group(function (): void {
        Route::get('/', [TindakanController::class, 'index'])->middleware('permission:rekam_medis.read');
        Route::get('/categories', [TindakanController::class, 'categories'])->middleware('permission:rekam_medis.read');
        Route::get('/{id}', [TindakanController::class, 'show'])->middleware('permission:rekam_medis.read');
        Route::post('/', [TindakanController::class, 'store'])->middleware('permission:master_tindakan.manage');
        Route::patch('/{id}', [TindakanController::class, 'update'])->middleware('permission:master_tindakan.manage');
        Route::delete('/{id}', [TindakanController::class, 'destroy'])->middleware('permission:master_tindakan.manage');
    });

    Route::prefix('resep')->middleware('permission:resep.process')->group(function (): void {
        Route::get('/antrian', [ResepController::class, 'antrian']);
        Route::get('/riwayat', [ResepController::class, 'riwayat']);
        Route::get('/{id}', [ResepController::class, 'show']);
        Route::patch('/{id}', [ResepController::class, 'update']);
    });

    Route::prefix('superadmin')->group(function (): void {
        // Akses User
        Route::get('/users', [SuperadminController::class, 'users'])->middleware('permission:user_access.manage');
        Route::post('/users', [SuperadminController::class, 'storeUser'])->middleware('permission:user_access.manage');
        Route::patch('/users/{id}', [SuperadminController::class, 'updateUser'])->middleware('permission:user_access.manage');
        Route::delete('/users/{id}', [SuperadminController::class, 'deleteUser'])->middleware('permission:user_access.manage');

        // Role & Poli
        Route::get('/roles', [SuperadminController::class, 'roles'])->middleware('permission:role_poli.manage');
        Route::post('/roles', [SuperadminController::class, 'storeRole'])->middleware('permission:role_poli.manage');
        Route::patch('/roles/{id}', [SuperadminController::class, 'updateRole'])->middleware('permission:role_poli.manage');
        Route::delete('/roles/{id}', [SuperadminController::class, 'deleteRole'])->middleware('permission:role_poli.manage');

        Route::get('/polis', [SuperadminController::class, 'polis'])->middleware('permission:role_poli.manage');
        Route::post('/polis', [SuperadminController::class, 'storePoli'])->middleware('permission:role_poli.manage');
        Route::patch('/polis/{id}', [SuperadminController::class, 'updatePoli'])->middleware('permission:role_poli.manage');
        Route::delete('/polis/{id}', [SuperadminController::class, 'deletePoli'])->middleware('permission:role_poli.manage');

        // Master ICD
        Route::get('/master-icd', [SuperadminController::class, 'icdCodes'])->middleware('permission:master_icd.manage');
        Route::post('/master-icd', [SuperadminController::class, 'storeIcdCode'])->middleware('permission:master_icd.manage');
        Route::patch('/master-icd/{id}', [SuperadminController::class, 'updateIcdCode'])->middleware('permission:master_icd.manage');
        Route::delete('/master-icd/{id}', [SuperadminController::class, 'deleteIcdCode'])->middleware('permission:master_icd.manage');

        // Sync Obat & Daftar Obat (master mirror)
        Route::get('/obat-sync', [ObatSyncController::class, 'index'])->middleware('permission:obat_sync.manage');
        Route::post('/obat-sync', [ObatSyncController::class, 'store'])->middleware('permission:obat_sync.manage');
        Route::get('/master-obat', [ObatSyncController::class, 'indexMasterObat'])->middleware('permission:obat_sync.manage');

        // Impersonate
        Route::post('/impersonate/{userId}', [\App\Http\Controllers\Api\ImpersonateController::class, 'impersonate']);
    });

    Route::prefix('audit-logs')->middleware('permission:audit_log.read')->group(function (): void {
        Route::get('/', [AuditLogController::class, 'index']);
    });
});


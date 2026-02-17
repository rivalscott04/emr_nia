<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\AuditLogController;
use App\Http\Controllers\Api\IcdController;
use App\Http\Controllers\Api\KunjunganController;
use App\Http\Controllers\Api\ObatController;
use App\Http\Controllers\Api\PasienController;
use App\Http\Controllers\Api\RekamMedisController;
use App\Http\Controllers\Api\SuperadminController;
use App\Http\Controllers\Api\DashboardController;
use Illuminate\Support\Facades\Route;

Route::prefix('auth')->group(function (): void {
    Route::post('/login', [AuthController::class, 'login']);

    Route::middleware('auth:api')->group(function (): void {
        Route::get('/me', [AuthController::class, 'me']);
        Route::post('/logout', [AuthController::class, 'logout']);
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
        Route::get('/{id}', [PasienController::class, 'show'])->middleware('permission:pasien.read');
        Route::post('/', [PasienController::class, 'store'])->middleware('permission:pasien.write');
        Route::patch('/{id}/allergies', [PasienController::class, 'updateAllergies'])->middleware('permission:pasien.write');
    });

    Route::prefix('kunjungan')->group(function (): void {
        Route::get('/', [KunjunganController::class, 'index'])->middleware('permission:kunjungan.read');
        Route::get('/{id}', [KunjunganController::class, 'show'])->middleware('permission:kunjungan.read');
        Route::post('/', [KunjunganController::class, 'store'])->middleware('permission:kunjungan.write');
        Route::patch('/{id}', [KunjunganController::class, 'update'])->middleware('permission:kunjungan.write');
    });

    Route::prefix('rekam-medis')->group(function (): void {
        Route::get('/', [RekamMedisController::class, 'index'])->middleware('permission:rekam_medis.read');
        Route::get('/kunjungan/{kunjunganId}', [RekamMedisController::class, 'showByKunjungan'])->middleware('permission:rekam_medis.read');
        Route::put('/kunjungan/{kunjunganId}', [RekamMedisController::class, 'upsertByKunjungan'])->middleware('permission:rekam_medis.write');
        Route::post('/kunjungan/{kunjunganId}/finalize', [RekamMedisController::class, 'finalizeByKunjungan'])->middleware('permission:rekam_medis.write');
        Route::post('/kunjungan/{kunjunganId}/addendum', [RekamMedisController::class, 'addendumByKunjungan'])->middleware('permission:rekam_medis.write');
        Route::post('/kunjungan/{kunjunganId}/resep/send', [RekamMedisController::class, 'sendResepByKunjungan'])->middleware('permission:rekam_medis.write');
    });

    Route::prefix('obat')->group(function (): void {
        Route::get('/search', [ObatController::class, 'search'])->middleware('permission:rekam_medis.read');
    });

    Route::prefix('icd')->group(function (): void {
        Route::get('/search', [IcdController::class, 'search'])->middleware('permission:rekam_medis.read');
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
    });

    Route::prefix('audit-logs')->middleware('permission:audit_log.read')->group(function (): void {
        Route::get('/', [AuditLogController::class, 'index']);
    });
});


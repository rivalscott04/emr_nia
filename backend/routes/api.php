<?php

use App\Http\Controllers\Api\KunjunganController;
use App\Http\Controllers\Api\PasienController;
use App\Http\Controllers\Api\RekamMedisController;
use Illuminate\Support\Facades\Route;

Route::prefix('pasien')->group(function (): void {
    Route::get('/', [PasienController::class, 'index']);
    Route::get('/search', [PasienController::class, 'search']);
    Route::get('/{id}', [PasienController::class, 'show']);
    Route::post('/', [PasienController::class, 'store']);
    Route::patch('/{id}/allergies', [PasienController::class, 'updateAllergies']);
});

Route::prefix('kunjungan')->group(function (): void {
    Route::get('/', [KunjunganController::class, 'index']);
    Route::get('/{id}', [KunjunganController::class, 'show']);
    Route::post('/', [KunjunganController::class, 'store']);
    Route::patch('/{id}', [KunjunganController::class, 'update']);
});

Route::prefix('rekam-medis')->group(function (): void {
    Route::get('/', [RekamMedisController::class, 'index']);
    Route::get('/kunjungan/{kunjunganId}', [RekamMedisController::class, 'showByKunjungan']);
    Route::put('/kunjungan/{kunjunganId}', [RekamMedisController::class, 'upsertByKunjungan']);
    Route::post('/kunjungan/{kunjunganId}/finalize', [RekamMedisController::class, 'finalizeByKunjungan']);
    Route::post('/kunjungan/{kunjunganId}/addendum', [RekamMedisController::class, 'addendumByKunjungan']);
    Route::post('/kunjungan/{kunjunganId}/resep/send', [RekamMedisController::class, 'sendResepByKunjungan']);
});


<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Urutan kunjungan pasien ke poli yang sama (untuk riwayat rutin, mis. ANC ke-1, ke-2).
     */
    public function up(): void
    {
        Schema::table('kunjungans', function (Blueprint $table): void {
            $table->unsignedSmallInteger('kunjungan_ke')->nullable()->after('poli')->comment('Kunjungan ke berapa (pasien + poli)');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('kunjungans', function (Blueprint $table): void {
            $table->dropColumn('kunjungan_ke');
        });
    }
};

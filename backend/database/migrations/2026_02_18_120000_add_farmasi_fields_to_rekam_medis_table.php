<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Status alur farmasi: Sent (= antrian) -> Processed -> Done.
     * Done tercatat untuk riwayat penyerahan.
     */
    public function up(): void
    {
        Schema::table('rekam_medis', function (Blueprint $table) {
            $table->timestamp('farmasi_done_at')->nullable()->after('resep_status');
            $table->unsignedBigInteger('farmasi_done_by')->nullable()->after('farmasi_done_at');
            $table->index('farmasi_done_at');
        });

        Schema::table('rekam_medis', function (Blueprint $table) {
            $table->foreign('farmasi_done_by')
                ->references('id')
                ->on('users')
                ->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('rekam_medis', function (Blueprint $table) {
            $table->dropForeign(['farmasi_done_by']);
            $table->dropIndex(['farmasi_done_at']);
        });
        Schema::table('rekam_medis', function (Blueprint $table) {
            $table->dropColumn(['farmasi_done_at', 'farmasi_done_by']);
        });
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Satu dokter_id hanya boleh dipakai satu user (mencegah bentrok & salah mapping kunjungan).
     */
    public function up(): void
    {
        DB::table('users')->where('dokter_id', '')->update(['dokter_id' => null]);

        Schema::table('users', function (Blueprint $table): void {
            $table->unique('dokter_id');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            $table->dropUnique(['dokter_id']);
        });
    }
};

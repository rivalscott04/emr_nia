<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Poli dengan supports_obstetri = true menampilkan form HPHT, G-P-A di kunjungan.
     */
    public function up(): void
    {
        Schema::table('master_polis', function (Blueprint $table): void {
            $table->boolean('supports_obstetri')->default(false)->after('is_active');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('master_polis', function (Blueprint $table): void {
            $table->dropColumn('supports_obstetri');
        });
    }
};

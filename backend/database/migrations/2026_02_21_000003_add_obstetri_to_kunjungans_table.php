<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Data obstetri (KIA/OBGYN): HPHT, G-P-A.
     */
    public function up(): void
    {
        Schema::table('kunjungans', function (Blueprint $table): void {
            $table->date('hpht')->nullable()->after('tinggi_badan');
            $table->unsignedTinyInteger('gravida')->nullable()->after('hpht')->comment('Kehamilan ke-');
            $table->unsignedTinyInteger('para')->nullable()->after('gravida')->comment('Jumlah persalinan hidup');
            $table->unsignedTinyInteger('abortus')->nullable()->after('para')->comment('Riwayat keguguran (jumlah)');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('kunjungans', function (Blueprint $table): void {
            $table->dropColumn(['hpht', 'gravida', 'para', 'abortus']);
        });
    }
};

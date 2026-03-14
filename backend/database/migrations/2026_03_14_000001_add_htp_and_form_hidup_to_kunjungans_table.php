<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Tambahan data obstetri: HTP (estimasi lahir), Form Hidup.
     */
    public function up(): void
    {
        Schema::table('kunjungans', function (Blueprint $table): void {
            $table->dateTime('htp')->nullable()->after('hpht');
            $table->unsignedTinyInteger('form_hidup')->nullable()->after('para')->comment('Jumlah anak hidup');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('kunjungans', function (Blueprint $table): void {
            $table->dropColumn(['htp', 'form_hidup']);
        });
    }
};

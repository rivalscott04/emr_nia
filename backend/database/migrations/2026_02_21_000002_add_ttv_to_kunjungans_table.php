<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('kunjungans', function (Blueprint $table) {
            $table->unsignedSmallInteger('td_sistole')->nullable()->after('keluhan_utama');
            $table->unsignedSmallInteger('td_diastole')->nullable()->after('td_sistole');
            $table->decimal('berat_badan', 5, 2)->nullable()->after('td_diastole');
            $table->decimal('tinggi_badan', 5, 2)->nullable()->after('berat_badan');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('kunjungans', function (Blueprint $table) {
            $table->dropColumn(['td_sistole', 'td_diastole', 'berat_badan', 'tinggi_badan']);
        });
    }
};

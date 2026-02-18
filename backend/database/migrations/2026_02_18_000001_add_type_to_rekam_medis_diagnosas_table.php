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
        Schema::table('rekam_medis_diagnosas', function (Blueprint $table) {
            $table->string('type', 10)->default('ICD-10')->after('name');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('rekam_medis_diagnosas', function (Blueprint $table) {
            $table->dropColumn('type');
        });
    }
};

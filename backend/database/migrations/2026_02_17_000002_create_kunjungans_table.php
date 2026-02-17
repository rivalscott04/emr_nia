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
        Schema::create('kunjungans', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('pasien_id');
            $table->string('pasien_nama');
            $table->string('dokter_id');
            $table->string('dokter_nama');
            $table->string('poli');
            $table->dateTime('tanggal');
            $table->text('keluhan_utama');
            $table->string('status');
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('pasien_id')
                ->references('id')
                ->on('pasiens')
                ->cascadeOnUpdate()
                ->restrictOnDelete();

            $table->index('status');
            $table->index('tanggal');
            $table->index('pasien_nama');
            $table->index('dokter_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('kunjungans');
    }
};


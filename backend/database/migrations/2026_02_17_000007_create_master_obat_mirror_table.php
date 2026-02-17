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
        Schema::create('master_obat_mirror', function (Blueprint $table) {
            $table->id();
            $table->string('external_noindex')->unique();
            $table->string('kode')->index();
            $table->string('nama')->index();
            $table->string('nama_kelompok')->nullable();
            $table->string('kode_satuan')->nullable();
            $table->decimal('harga_jual', 15, 2)->nullable();
            $table->decimal('stok', 15, 2)->nullable();
            $table->json('raw_payload')->nullable();
            $table->dateTime('synced_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('master_obat_mirror');
    }
};


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
        Schema::create('pasiens', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('nik', 16)->unique();
            $table->string('no_rm')->unique();
            $table->string('nama');
            $table->date('tanggal_lahir');
            $table->char('jenis_kelamin', 1);
            $table->text('alamat');
            $table->string('no_hp');
            $table->string('golongan_darah')->nullable();
            $table->string('pekerjaan')->nullable();
            $table->string('status_pernikahan')->nullable();
            $table->string('nama_ibu_kandung')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index('nama');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pasiens');
    }
};


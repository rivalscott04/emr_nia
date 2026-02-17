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
        Schema::create('rekam_medis', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('kunjungan_id')->unique();
            $table->string('status')->default('Draft');
            $table->string('resep_status')->default('Draft');

            $table->text('subjective')->nullable();
            $table->text('objective')->nullable();
            $table->text('assessment')->nullable();
            $table->text('plan')->nullable();
            $table->text('instruksi')->nullable();

            $table->unsignedSmallInteger('sistole')->nullable();
            $table->unsignedSmallInteger('diastole')->nullable();
            $table->unsignedSmallInteger('nadi')->nullable();
            $table->unsignedSmallInteger('rr')->nullable();
            $table->decimal('suhu', 4, 1)->nullable();
            $table->unsignedSmallInteger('spo2')->nullable();
            $table->decimal('berat_badan', 5, 2)->nullable();
            $table->decimal('tinggi_badan', 5, 2)->nullable();

            $table->timestamps();
            $table->softDeletes();

            $table->foreign('kunjungan_id')
                ->references('id')
                ->on('kunjungans')
                ->cascadeOnUpdate()
                ->restrictOnDelete();

            $table->index('status');
            $table->index('resep_status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('rekam_medis');
    }
};


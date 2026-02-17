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
        Schema::create('rekam_medis_diagnosas', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('rekam_medis_id');
            $table->string('code');
            $table->string('name');
            $table->boolean('is_utama')->default(false);
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('rekam_medis_id')
                ->references('id')
                ->on('rekam_medis')
                ->cascadeOnUpdate()
                ->cascadeOnDelete();

            $table->index('code');
            $table->index('is_utama');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('rekam_medis_diagnosas');
    }
};


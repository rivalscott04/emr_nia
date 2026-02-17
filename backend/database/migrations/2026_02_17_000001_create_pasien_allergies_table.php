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
        Schema::create('pasien_allergies', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('pasien_id');
            $table->string('name');
            $table->string('name_normalized');
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('pasien_id')
                ->references('id')
                ->on('pasiens')
                ->cascadeOnUpdate()
                ->cascadeOnDelete();

            $table->index('name');
            $table->unique(['pasien_id', 'name_normalized']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pasien_allergies');
    }
};


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
        Schema::create('rekam_medis_addendums', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('rekam_medis_id');
            $table->text('catatan');
            $table->string('dokter');
            $table->dateTime('timestamp');
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('rekam_medis_id')
                ->references('id')
                ->on('rekam_medis')
                ->cascadeOnUpdate()
                ->cascadeOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('rekam_medis_addendums');
    }
};


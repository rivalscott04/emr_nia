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
        Schema::create('master_icd_codes', function (Blueprint $table): void {
            $table->id();
            $table->string('type', 20);
            $table->string('code', 20);
            $table->string('name', 255);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->unique(['type', 'code']);
            $table->index(['type', 'is_active']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('master_icd_codes');
    }
};

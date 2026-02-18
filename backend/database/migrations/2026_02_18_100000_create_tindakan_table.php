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
        Schema::create('tindakan', function (Blueprint $table): void {
            $table->id();
            $table->string('kode', 30)->unique();
            $table->string('nama', 255);
            $table->string('kategori', 80);
            $table->decimal('tarif', 14, 0)->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->index(['kategori', 'is_active']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tindakan');
    }
};

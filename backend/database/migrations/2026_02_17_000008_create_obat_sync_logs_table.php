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
        Schema::create('obat_sync_logs', function (Blueprint $table) {
            $table->id();
            $table->dateTime('started_at');
            $table->dateTime('finished_at')->nullable();
            $table->string('status')->index();
            $table->unsignedInteger('total_fetched')->default(0);
            $table->unsignedInteger('total_inserted')->default(0);
            $table->unsignedInteger('total_updated')->default(0);
            $table->unsignedInteger('total_skipped')->default(0);
            $table->text('error_message')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('obat_sync_logs');
    }
};


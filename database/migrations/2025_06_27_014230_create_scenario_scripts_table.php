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
        Schema::create('scenario_scripts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('scenario_id')
                ->constrained('interaction_scenarios')
                ->onDelete('cascade');
            $table->json('script'); // Lưu json thông số kịch bản
            $table->timestamps();

            // Index để truy vấn nhanh theo scenario_id
            $table->index('scenario_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('scenario_scripts');
    }
};

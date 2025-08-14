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
        Schema::create('interaction_scenarios', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('name');
            $table->text('description')->nullable();
            $table->boolean('shuffle_actions')->default(false);
            $table->boolean('run_count')->default(false);
            $table->integer('from_count')->default(1);
            $table->integer('to_count')->default(5);
            $table->enum('status', ['active', 'inactive', 'draft'])->default('active');
            $table->integer('total_interactions')->default(0);
            $table->integer('execution_count')->default(0);
            $table->timestamp('last_executed_at')->nullable();
            $table->json('settings')->nullable(); // Lưu các cài đặt bổ sung
            $table->timestamps();
            
            // Indexes
            $table->index(['user_id', 'status']);
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('interaction_scenarios');
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('account_tasks', function (Blueprint $table) {
            $table->id();
            // $table->foreignId('tiktok_account_id')->constrained()->cascadeOnDelete();
            $table->unsignedBigInteger('tiktok_account_id'); // Tạm thời dùng unsignedBigInteger
            $table->foreignId('interaction_scenario_id')->nullable()->constrained('interaction_scenarios')->cascadeOnDelete();
            $table->foreignId('device_id')->nullable()->constrained()->cascadeOnDelete();
            $table->string('task_type');
            $table->json('parameters')->nullable();
            $table->enum('priority', ['low', 'medium', 'high'])->default('medium');
            $table->enum('status', ['pending', 'running', 'completed', 'failed'])->default('pending');
            $table->json('result')->nullable();
            $table->text('error_message')->nullable();
            $table->unsignedTinyInteger('retry_count')->default(0);
            $table->unsignedTinyInteger('max_retries')->default(3);
            $table->timestamp('scheduled_at')->nullable();
            $table->timestamp('started_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();

            $table->index(['device_id', 'status', 'scheduled_at']);
            $table->index('interaction_scenario_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('account_tasks');
    }
};

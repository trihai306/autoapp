<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('facebook_accounts', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id')->nullable();
            $table->string('username')->unique();
            $table->string('email')->nullable()->unique();
            $table->string('password')->nullable();
            $table->string('phone_number')->nullable();
            $table->enum('status', ['active', 'inactive', 'suspended', 'running', 'error'])->default('inactive');
            $table->unsignedBigInteger('device_id')->nullable();
            $table->unsignedBigInteger('proxy_id')->nullable();
            $table->unsignedBigInteger('scenario_id')->nullable();
            $table->integer('follower_count')->default(0);
            $table->integer('heart_count')->default(0);
            $table->integer('video_count')->default(0);
            $table->integer('estimated_views')->default(0);
            $table->boolean('two_factor_enabled')->default(false);
            $table->json('two_factor_backup_codes')->nullable();
            $table->enum('connection_type', ['wifi', '4g'])->default('wifi');
            $table->text('notes')->nullable();
            $table->string('device_info')->nullable();
            $table->timestamp('last_activity')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('facebook_accounts');
    }
};



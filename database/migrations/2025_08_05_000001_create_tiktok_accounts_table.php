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
        Schema::create('tiktok_accounts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('username')->unique();
            $table->string('password');
            $table->string('nickname')->nullable();
            $table->string('avatar_url')->nullable();
            $table->unsignedBigInteger('follower_count')->default(0);
            $table->unsignedBigInteger('following_count')->default(0);
            $table->unsignedBigInteger('heart_count')->default(0);
            $table->unsignedBigInteger('video_count')->default(0);
            $table->text('bio_signature')->nullable();
            $table->string('status')->default('active'); // e.g., active, inactive, banned
            $table->unsignedBigInteger('proxy_id')->nullable();
            $table->timestamp('last_login_at')->nullable();
            $table->timestamp('last_activity_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tiktok_accounts');
    }
};

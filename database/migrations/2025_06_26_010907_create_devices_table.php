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
        Schema::create('devices', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('device_name'); // Tên thiết bị
            $table->string('device_id')->unique(); // ID duy nhất của thiết bị
            $table->string('device_type')->nullable(); // Loại thiết bị (mobile, desktop, tablet)
            $table->string('platform')->nullable(); // Hệ điều hành (iOS, Android, Windows...)
            $table->string('app_version')->nullable(); // Phiên bản app
            $table->string('ip_address')->nullable(); // Địa chỉ IP đăng nhập
            $table->text('user_agent')->nullable(); // User agent
            $table->enum('status', ['active', 'inactive', 'blocked'])->default('active');
            $table->timestamp('last_active_at')->nullable(); // Lần hoạt động cuối
            $table->timestamp('first_login_at')->nullable(); // Lần đăng nhập đầu tiên
            $table->json('push_tokens')->nullable(); // Token để gửi thông báo push
            $table->timestamps();
            
            $table->index(['user_id', 'status']);
            $table->index(['device_id']);
            $table->index(['last_active_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('devices');
    }
};

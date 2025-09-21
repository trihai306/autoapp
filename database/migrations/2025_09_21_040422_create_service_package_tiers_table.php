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
        Schema::create('service_package_tiers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('service_package_id')->constrained()->onDelete('cascade');
            $table->string('name'); // Basic, Pro, Enterprise
            $table->string('slug');
            $table->text('description')->nullable();
            $table->integer('device_limit'); // Số lượng thiết bị
            $table->decimal('price', 10, 2); // Giá cho tier này
            $table->string('currency', 3)->default('VND');
            $table->boolean('is_popular')->default(false); // Tier phổ biến
            $table->boolean('is_active')->default(true);
            $table->integer('sort_order')->default(0);
            $table->json('features')->nullable(); // Các tính năng đặc biệt cho tier
            $table->json('limits')->nullable(); // Các giới hạn cho tier
            $table->timestamps();

            // Index cho performance
            $table->index(['service_package_id', 'is_active']);
            $table->index(['service_package_id', 'sort_order']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('service_package_tiers');
    }
};
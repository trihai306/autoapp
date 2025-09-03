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
        Schema::create('service_packages', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // Tên gói dịch vụ
            $table->string('slug')->unique(); // Slug cho URL
            $table->text('description')->nullable(); // Mô tả gói dịch vụ
            $table->decimal('price', 10, 2); // Giá gói dịch vụ
            $table->string('currency', 3)->default('VND'); // Đơn vị tiền tệ
            $table->integer('duration_days')->nullable(); // Thời hạn sử dụng (ngày)
            $table->integer('duration_months')->nullable(); // Thời hạn sử dụng (tháng)
            $table->integer('duration_years')->nullable(); // Thời hạn sử dụng (năm)
            $table->boolean('is_active')->default(true); // Trạng thái hoạt động
            $table->boolean('is_popular')->default(false); // Gói phổ biến
            $table->integer('sort_order')->default(0); // Thứ tự sắp xếp
            $table->json('features')->nullable(); // Các tính năng (JSON)
            $table->json('limits')->nullable(); // Giới hạn sử dụng (JSON)
            $table->string('icon')->nullable(); // Icon gói dịch vụ
            $table->string('color', 7)->nullable(); // Màu sắc gói dịch vụ
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('service_packages');
    }
};

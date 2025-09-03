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
        Schema::create('service_package_features', function (Blueprint $table) {
            $table->id();
            $table->foreignId('service_package_id')->constrained()->onDelete('cascade');
            $table->string('name'); // Tên tính năng
            $table->text('description')->nullable(); // Mô tả tính năng
            $table->string('type')->default('feature'); // Loại: feature, limit, benefit
            $table->string('value')->nullable(); // Giá trị (ví dụ: "100", "unlimited")
            $table->string('unit')->nullable(); // Đơn vị (ví dụ: "accounts", "GB", "times")
            $table->boolean('is_included')->default(true); // Có được bao gồm không
            $table->integer('sort_order')->default(0); // Thứ tự sắp xếp
            $table->string('icon')->nullable(); // Icon tính năng
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('service_package_features');
    }
};

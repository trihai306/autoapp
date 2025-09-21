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
        Schema::table('service_packages', function (Blueprint $table) {
            // Thêm foreign key cho category
            $table->foreignId('category_id')->nullable()->constrained('service_package_categories')->onDelete('cascade');
            
            // Thay đổi các field để phù hợp với cấu trúc mới
            $table->string('duration_type')->default('months'); // months, years
            $table->integer('duration_value')->default(1); // 3, 6, 12
            
            // Xóa các field cũ không cần thiết
            $table->dropColumn(['duration_days', 'duration_months', 'duration_years']);
            
            // Thêm các field mới
            $table->string('platform')->nullable(); // facebook, instagram, tiktok
            $table->json('platform_settings')->nullable(); // Cài đặt đặc biệt cho platform
            
            // Index cho performance
            $table->index(['category_id', 'is_active']);
            $table->index(['platform', 'is_active']);
            $table->index(['duration_type', 'duration_value']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('service_packages', function (Blueprint $table) {
            // Xóa foreign key
            $table->dropForeign(['category_id']);
            $table->dropColumn('category_id');
            
            // Xóa các field mới
            $table->dropColumn(['duration_type', 'duration_value', 'platform', 'platform_settings']);
            
            // Thêm lại các field cũ
            $table->integer('duration_days')->nullable();
            $table->integer('duration_months')->nullable();
            $table->integer('duration_years')->nullable();
        });
    }
};
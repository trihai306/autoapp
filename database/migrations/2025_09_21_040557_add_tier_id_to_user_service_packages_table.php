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
        Schema::table('user_service_packages', function (Blueprint $table) {
            // Thêm foreign key cho tier
            $table->foreignId('tier_id')->nullable()->constrained('service_package_tiers')->onDelete('cascade');
            
            // Thêm index cho performance
            $table->index(['tier_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('user_service_packages', function (Blueprint $table) {
            // Xóa foreign key
            $table->dropForeign(['tier_id']);
            $table->dropColumn('tier_id');
        });
    }
};
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
            // Bỏ trường price vì giá được quản lý ở tiers
            $table->dropColumn(['price', 'currency']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('service_packages', function (Blueprint $table) {
            // Thêm lại trường price nếu cần rollback
            $table->decimal('price', 10, 2)->nullable();
            $table->string('currency', 3)->default('VND');
        });
    }
};

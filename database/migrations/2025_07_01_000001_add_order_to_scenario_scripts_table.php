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
        Schema::table('scenario_scripts', function (Blueprint $table) {
            // Thêm cột order, mặc định 0, đặt sau scenario_id để dễ đọc
            $table->unsignedInteger('order')->default(0)->after('scenario_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('scenario_scripts', function (Blueprint $table) {
            $table->dropColumn('order');
        });
    }
};

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
        Schema::table('tiktok_accounts', function (Blueprint $table) {
            $table->enum('connection_type', ['wifi', '4g'])->default('wifi')->after('scenario_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tiktok_accounts', function (Blueprint $table) {
            $table->dropColumn('connection_type');
        });
    }
};

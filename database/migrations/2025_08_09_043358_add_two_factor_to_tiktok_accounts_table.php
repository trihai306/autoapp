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
            $table->boolean('two_factor_enabled')->default(false)->after('scenario_id');
            $table->json('two_factor_backup_codes')->nullable()->after('two_factor_enabled');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tiktok_accounts', function (Blueprint $table) {
            $table->dropColumn(['two_factor_enabled', 'two_factor_backup_codes']);
        });
    }
};

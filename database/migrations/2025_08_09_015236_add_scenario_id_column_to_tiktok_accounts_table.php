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
            $table->foreignId('scenario_id')->nullable()->after('proxy_id')->constrained('interaction_scenarios')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tiktok_accounts', function (Blueprint $table) {
            $table->dropConstrainedForeignId('scenario_id');
        });
    }
};

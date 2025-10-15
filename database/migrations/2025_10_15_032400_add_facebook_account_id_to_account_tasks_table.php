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
        Schema::table('account_tasks', function (Blueprint $table) {
            $table->unsignedBigInteger('facebook_account_id')->nullable()->after('tiktok_account_id');
            $table->foreign('facebook_account_id')->references('id')->on('facebook_accounts')->onDelete('cascade');
            $table->index(['facebook_account_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('account_tasks', function (Blueprint $table) {
            $table->dropForeign(['facebook_account_id']);
            $table->dropIndex(['facebook_account_id', 'status']);
            $table->dropColumn('facebook_account_id');
        });
    }
};

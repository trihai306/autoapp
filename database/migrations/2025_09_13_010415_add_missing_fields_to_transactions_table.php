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
        Schema::table('transactions', function (Blueprint $table) {
            $table->string('currency', 3)->default('VND')->after('amount');
            $table->unsignedBigInteger('reference_id')->nullable()->after('description');
            $table->string('reference_type')->nullable()->after('reference_id');
            $table->json('metadata')->nullable()->after('reference_type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->dropColumn(['currency', 'reference_id', 'reference_type', 'metadata']);
        });
    }
};

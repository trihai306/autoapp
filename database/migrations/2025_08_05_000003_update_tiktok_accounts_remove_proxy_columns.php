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
            // Loại bỏ các cột proxy cũ
            $table->dropColumn([
                'proxy_port',
                'proxy_username',
                'proxy_password'
            ]);
            
            // Thay đổi proxy_id từ unsignedBigInteger thành foreign key
            $table->dropColumn('proxy_id');
            $table->foreignId('proxy_id')->nullable()->constrained()->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tiktok_accounts', function (Blueprint $table) {
            // Khôi phục các cột proxy cũ
            $table->unsignedBigInteger('proxy_port')->nullable();
            $table->string('proxy_username')->nullable();
            $table->string('proxy_password')->nullable();
            
            // Khôi phục proxy_id thành unsignedBigInteger
            $table->dropForeign(['proxy_id']);
            $table->dropColumn('proxy_id');
            $table->unsignedBigInteger('proxy_id')->nullable();
        });
    }
};

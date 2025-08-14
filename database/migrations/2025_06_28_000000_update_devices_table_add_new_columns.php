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
        Schema::table('devices', function (Blueprint $table) {
            // Serial mới, giữ nguyên device_id cũ để tương thích
            $table->string('serial')->nullable()->after('device_id');
            $table->string('plan')->nullable()->after('serial');
            $table->boolean('is_online')->default(false)->after('plan');
            // Khóa ngoại tới bảng proxies, có thể null
            $table->unsignedBigInteger('proxy_id')->nullable()->after('is_online');
            $table->text('note')->nullable()->after('proxy_id');
            $table->string('os_version')->nullable()->after('note');

            // index
            $table->index('serial');
            $table->index('is_online');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('devices', function (Blueprint $table) {
            $table->dropColumn(['serial', 'plan', 'is_online', 'proxy_id', 'note', 'os_version']);
        });
    }
};

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
        Schema::create('ai_spending_histories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('transaction_id')->nullable()->constrained()->onDelete('set null');
            $table->string('feature_name')->comment('Tên tính năng AI được sử dụng');
            $table->string('model_name')->comment('Tên model AI được sử dụng');
            $table->decimal('tokens_used', 10, 2)->default(0)->comment('Số lượng tokens đã sử dụng');
            $table->decimal('cost', 15, 6)->default(0)->comment('Chi phí tính bằng tiền');
            $table->json('metadata')->nullable()->comment('Thông tin bổ sung về việc sử dụng AI');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ai_spending_histories');
    }
};

<?php

namespace Database\Seeders;

use App\Models\AccountTask;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class AccountTaskSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Tạo nhiều pending tasks để test
        AccountTask::factory()->count(30)->create(['status' => 'pending']);
        
        // Tạo một số tasks với status khác
        AccountTask::factory()->count(10)->create(['status' => 'completed']);
        AccountTask::factory()->count(5)->create(['status' => 'failed']);
        AccountTask::factory()->count(3)->create(['status' => 'running']);
    }
}

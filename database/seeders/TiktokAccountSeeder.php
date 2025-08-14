<?php

namespace Database\Seeders;

use App\Models\TiktokAccount;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class TiktokAccountSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        TiktokAccount::factory()->count(10)->create();
    }
}

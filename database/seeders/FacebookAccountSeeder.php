<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\FacebookAccount;

class FacebookAccountSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $count = (int) (env('FACEBOOK_ACCOUNT_SEED_COUNT', 50));
        FacebookAccount::factory()->count($count)->create();
    }
}

<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Proxy;
use App\Models\User;

class ProxySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $users = User::all();
        
        if ($users->isEmpty()) {
            $this->command->warn('No users found. Please run UserSeeder first.');
            return;
        }

        foreach ($users as $user) {
            // Tạo 3-5 proxy cho mỗi user
            Proxy::factory()
                ->count(rand(3, 5))
                ->for($user)
                ->create();
        }

        $this->command->info('Proxy seeder completed successfully.');
    }
}

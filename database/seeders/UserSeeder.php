<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        // Create an admin user
        $admin = User::create([
            'first_name' => 'Admin',
            'last_name' => 'User',
            'email' => 'admin@example.com',
            'email_verified_at' => now(),
            'password' => Hash::make('password'),
            'phone_number' => '1234567890',
            'avatar' => 'https://i.pravatar.cc/150?u=admin@example.com',
            'balance' => 1000000,
        ]);
        // Ensure admin has a fresh login token
        $admin->generateLoginToken();

        // Create 10 random users (factory already pre-fills login_token)
        User::factory()->count(10)->create();
    }
}

<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            UserSeeder::class,
            NotificationSeeder::class,
            RolePermissionSeeder::class,
            DetailedPermissionSeeder::class, // Add detailed permissions
            SuperAdminSeeder::class, // Tạo super admin sau khi có roles
            TransactionSeeder::class,
            InteractionScenarioSeeder::class, // Tạo scenarios trước
            DeviceSeeder::class, // Tạo devices trước
            TiktokAccountSeeder::class, // Tạo accounts sau khi có scenarios
            AccountTaskSeeder::class, // Tạo tasks cuối cùng
        ]);
    }
}

<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use App\Models\User;

class UserRoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Đảm bảo role "user" tồn tại
        $userRole = Role::firstOrCreate(
            ['name' => 'user'],
            ['guard_name' => 'sanctum']
        );

        // Gán role "user" cho tất cả người dùng hiện có chưa có role
        $usersWithoutRoles = User::whereDoesntHave('roles')->get();
        
        foreach ($usersWithoutRoles as $user) {
            $user->assignRole('user');
            $this->command->info("Assigned 'user' role to: {$user->email}");
        }

        $this->command->info('User roles assigned successfully!');
    }
}

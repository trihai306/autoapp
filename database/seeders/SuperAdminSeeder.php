<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Illuminate\Support\Facades\Hash;

class SuperAdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Tạo hoặc cập nhật user admin@example.com
        $admin = User::updateOrCreate(
            ['email' => 'admin@example.com'],
            [
                'first_name' => 'Super',
                'last_name' => 'Admin',
                'email' => 'admin@example.com',
                'email_verified_at' => now(),
                'password' => Hash::make('password'),
                'phone_number' => '1234567890',
                'avatar' => 'https://i.pravatar.cc/150?u=admin@example.com',
                'balance' => 1000000,
            ]
        );

        // Đảm bảo user có login token
        if (!$admin->login_token) {
            $admin->generateLoginToken();
        }

        // Tìm role super-admin
        $superAdminRole = Role::where('name', 'super-admin')->where('guard_name', 'sanctum')->first();
        
        if ($superAdminRole) {
            // Xóa tất cả role cũ và gán role super-admin
            $admin->syncRoles([$superAdminRole]);
            $this->command->info("✅ User {$admin->email} đã được gán role super-admin");
            
            // Đảm bảo user có TẤT CẢ permissions (gán trực tiếp ngoài role)
            $allPermissions = Permission::where('guard_name', 'sanctum')->get();
            $admin->syncPermissions($allPermissions);
            
            $this->command->info("🔐 Đã gán {$allPermissions->count()} permissions trực tiếp cho user");
            
            // Hiển thị danh sách permissions
            $this->command->info("📋 Danh sách permissions:");
            foreach ($allPermissions->pluck('name')->chunk(5) as $chunk) {
                $this->command->info("   • " . $chunk->implode(', '));
            }
            
        } else {
            $this->command->warn("⚠️  Role 'super-admin' không tồn tại. Vui lòng chạy DetailedPermissionSeeder trước.");
            
            // Nếu không có role, vẫn gán tất cả permissions trực tiếp
            $allPermissions = Permission::where('guard_name', 'sanctum')->get();
            if ($allPermissions->count() > 0) {
                $admin->syncPermissions($allPermissions);
                $this->command->info("🔐 Đã gán {$allPermissions->count()} permissions trực tiếp cho user (không có role)");
            }
        }

        // Kiểm tra và hiển thị thông tin cuối cùng
        $admin->refresh(); // Refresh để lấy dữ liệu mới nhất
        
        $this->command->info("✅ Super Admin user đã được tạo/cập nhật thành công!");
        $this->command->info("📧 Email: {$admin->email}");
        $this->command->info("🔑 Password: password");
        $this->command->info("👑 Roles: " . $admin->getRoleNames()->implode(', '));
        $this->command->info("🔐 Total Permissions: " . $admin->getAllPermissions()->count());
        $this->command->info("💰 Balance: " . number_format($admin->balance) . " VND");
        
        // Kiểm tra một số permissions quan trọng
        $importantPermissions = [
            'users.view', 'users.create', 'users.edit', 'users.delete',
            'roles.view', 'roles.create', 'roles.edit', 'roles.delete',
            'permissions.view', 'permissions.create', 'permissions.edit', 'permissions.delete',
            'transactions.view', 'transactions.approve', 'transactions.reject',
            'tiktok-accounts.view', 'tiktok-accounts.create', 'tiktok-accounts.edit', 'tiktok-accounts.delete',
            'settings.view', 'settings.edit',
            'analytics.view'
        ];
        
        $hasAllImportant = true;
        foreach ($importantPermissions as $permission) {
            if (!$admin->can($permission)) {
                $hasAllImportant = false;
                $this->command->error("❌ Missing permission: {$permission}");
            }
        }
        
        if ($hasAllImportant) {
            $this->command->info("✅ Tất cả permissions quan trọng đã được gán thành công!");
            $this->command->info("🚀 Super Admin có thể truy cập tất cả tính năng trong hệ thống!");
        }
    }
}

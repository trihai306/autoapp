<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use App\Models\User;

class DetailedPermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Define all permissions by module
        $permissions = [
            // User Management
            'users.view' => 'View users',
            'users.create' => 'Create users',
            'users.edit' => 'Edit users',
            'users.delete' => 'Delete users',
            'users.assign-roles' => 'Assign roles to users',
            'users.bulk-operations' => 'Perform bulk operations on users',

            // Role Management
            'roles.view' => 'View roles',
            'roles.create' => 'Create roles',
            'roles.edit' => 'Edit roles',
            'roles.delete' => 'Delete roles',
            'roles.bulk-operations' => 'Perform bulk operations on roles',

            // Permission Management
            'permissions.view' => 'View permissions',
            'permissions.create' => 'Create permissions',
            'permissions.edit' => 'Edit permissions',
            'permissions.delete' => 'Delete permissions',
            'permissions.bulk-operations' => 'Perform bulk operations on permissions',

            // Transaction Management
            'transactions.view' => 'View transactions',
            'transactions.view-own' => 'View own transactions',
            'transactions.create' => 'Create transactions',
            'transactions.edit' => 'Edit transactions',
            'transactions.delete' => 'Delete transactions',
            'transactions.approve' => 'Approve transactions',
            'transactions.reject' => 'Reject transactions',
            'transactions.deposit' => 'Make deposits',
            'transactions.withdrawal' => 'Make withdrawals',
            'transactions.bulk-operations' => 'Perform bulk operations on transactions',

            // Notification Management
            'notifications.view' => 'View all notifications',
            'notifications.view-own' => 'View own notifications',
            'notifications.create' => 'Create notifications',
            'notifications.edit' => 'Edit notifications',
            'notifications.delete' => 'Delete notifications',
            'notifications.mark-read' => 'Mark notifications as read',
            'notifications.bulk-operations' => 'Perform bulk operations on notifications',

            // AI Spending History
            'ai-spending.view' => 'View AI spending history',
            'ai-spending.view-own' => 'View own AI spending history',
            'ai-spending.record' => 'Record AI usage',

            // TikTok Account Management
            'tiktok-accounts.view' => 'View TikTok accounts',
            'tiktok-accounts.create' => 'Create TikTok accounts',
            'tiktok-accounts.edit' => 'Edit TikTok accounts',
            'tiktok-accounts.delete' => 'Delete TikTok accounts',
            'tiktok-accounts.import' => 'Import TikTok accounts',
            'tiktok-accounts.bulk-operations' => 'Perform bulk operations on TikTok accounts',

            // Device Management
            'devices.view' => 'View devices',
            'devices.create' => 'Create devices',
            'devices.edit' => 'Edit devices',
            'devices.delete' => 'Delete devices',

            // Interaction Scenarios
            'interaction-scenarios.view' => 'View interaction scenarios',
            'interaction-scenarios.create' => 'Create interaction scenarios',
            'interaction-scenarios.edit' => 'Edit interaction scenarios',
            'interaction-scenarios.delete' => 'Delete interaction scenarios',

            // Scenario Scripts
            'scenario-scripts.view' => 'View scenario scripts',
            'scenario-scripts.create' => 'Create scenario scripts',
            'scenario-scripts.edit' => 'Edit scenario scripts',
            'scenario-scripts.delete' => 'Delete scenario scripts',

            // Account Tasks
            'account-tasks.view' => 'View account tasks',
            'account-tasks.create' => 'Create account tasks',
            'account-tasks.edit' => 'Edit account tasks',
            'account-tasks.delete' => 'Delete account tasks',

            // Content Group Management
            'content-groups.view' => 'View content groups',
            'content-groups.create' => 'Create content groups',
            'content-groups.edit' => 'Edit content groups',
            'content-groups.delete' => 'Delete content groups',
            'content-groups.bulk-operations' => 'Perform bulk operations on content groups',

            // Content Management
            'contents.view' => 'View contents',
            'contents.create' => 'Create contents',
            'contents.edit' => 'Edit contents',
            'contents.delete' => 'Delete contents',
            'contents.bulk-operations' => 'Perform bulk operations on contents',

            // Settings
            'settings.view' => 'View settings',
            'settings.edit' => 'Edit settings',

            // Analytics
            'analytics.view' => 'View analytics',
            'analytics.transactions' => 'View transaction analytics',

            // Profile Management
            'profile.view' => 'View own profile',
            'profile.edit' => 'Edit own profile',
            'profile.change-password' => 'Change own password',
            'profile.update-avatar' => 'Update own avatar',
        ];

        // Create permissions
        foreach ($permissions as $name => $description) {
            Permission::firstOrCreate(
                ['name' => $name],
                ['guard_name' => 'sanctum']
            );
        }

        // Define roles and their permissions
        $roles = [
            'super-admin' => [
                'description' => 'Super Administrator with all permissions',
                'permissions' => array_keys($permissions), // All permissions
            ],
            'admin' => [
                'description' => 'Administrator with most permissions',
                'permissions' => [
                    // User Management (limited)
                    'users.view', 'users.create', 'users.edit', 'users.assign-roles',
                    
                    // Transaction Management
                    'transactions.view', 'transactions.approve', 'transactions.reject', 'transactions.bulk-operations',
                    
                    // Notification Management
                    'notifications.view', 'notifications.create', 'notifications.edit', 'notifications.delete', 'notifications.bulk-operations',
                    
                    // AI Spending
                    'ai-spending.view',
                    
                    // TikTok Accounts
                    'tiktok-accounts.view', 'tiktok-accounts.create', 'tiktok-accounts.edit', 'tiktok-accounts.delete', 'tiktok-accounts.import', 'tiktok-accounts.bulk-operations',
                    
                    // Devices
                    'devices.view', 'devices.create', 'devices.edit', 'devices.delete',
                    
                    // Scenarios and Scripts
                    'interaction-scenarios.view', 'interaction-scenarios.create', 'interaction-scenarios.edit', 'interaction-scenarios.delete',
                    'scenario-scripts.view', 'scenario-scripts.create', 'scenario-scripts.edit', 'scenario-scripts.delete',
                    'account-tasks.view', 'account-tasks.create', 'account-tasks.edit', 'account-tasks.delete',
                    
                    // Content Management
                    'content-groups.view', 'content-groups.create', 'content-groups.edit', 'content-groups.delete', 'content-groups.bulk-operations',
                    'contents.view', 'contents.create', 'contents.edit', 'contents.delete', 'contents.bulk-operations',
                    
                    // Analytics
                    'analytics.view', 'analytics.transactions',
                    
                    // Profile
                    'profile.view', 'profile.edit', 'profile.change-password', 'profile.update-avatar',
                ],
            ],
            'manager' => [
                'description' => 'Manager with moderate permissions',
                'permissions' => [
                    // Limited User Management
                    'users.view',
                    
                    // Transaction Management (limited)
                    'transactions.view', 'transactions.approve', 'transactions.reject',
                    
                    // TikTok Accounts
                    'tiktok-accounts.view', 'tiktok-accounts.create', 'tiktok-accounts.edit', 'tiktok-accounts.import',
                    
                    // Devices
                    'devices.view', 'devices.create', 'devices.edit',
                    
                    // Scenarios and Scripts
                    'interaction-scenarios.view', 'interaction-scenarios.create', 'interaction-scenarios.edit',
                    'scenario-scripts.view', 'scenario-scripts.create', 'scenario-scripts.edit',
                    'account-tasks.view', 'account-tasks.create', 'account-tasks.edit',
                    
                    // Content Management
                    'content-groups.view', 'content-groups.create', 'content-groups.edit',
                    'contents.view', 'contents.create', 'contents.edit',
                    
                    // Analytics
                    'analytics.view', 'analytics.transactions',
                    
                    // Profile
                    'profile.view', 'profile.edit', 'profile.change-password', 'profile.update-avatar',
                ],
            ],
            'user' => [
                'description' => 'Regular user with basic permissions',
                'permissions' => [
                    // Own data only
                    'transactions.view-own', 'transactions.deposit', 'transactions.withdrawal',
                    'notifications.view-own', 'notifications.mark-read',
                    'ai-spending.view-own', 'ai-spending.record',
                    
                    // Profile
                    'profile.view', 'profile.edit', 'profile.change-password', 'profile.update-avatar',
                ],
            ],
        ];

        // Create roles and assign permissions
        foreach ($roles as $roleName => $roleData) {
            $role = Role::firstOrCreate(
                ['name' => $roleName],
                ['guard_name' => 'sanctum']
            );

            // Assign permissions to role
            $role->syncPermissions($roleData['permissions']);
        }

        // Assign super-admin role to first user if exists
        $firstUser = User::first();
        if ($firstUser && !$firstUser->hasAnyRole(['super-admin', 'admin'])) {
            $firstUser->assignRole('super-admin');
            $this->command->info("Assigned super-admin role to user: {$firstUser->email}");
        }

        $this->command->info('Detailed permissions and roles created successfully!');
    }
}
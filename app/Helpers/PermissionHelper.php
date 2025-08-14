<?php

namespace App\Helpers;

use Illuminate\Support\Facades\Auth;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class PermissionHelper
{
    /**
     * Check if current user has permission
     */
    public static function hasPermission(string $permission): bool
    {
        if (!Auth::check()) {
            return false;
        }

        return Auth::user()->can($permission);
    }

    /**
     * Check if current user has any of the given permissions
     */
    public static function hasAnyPermission(array $permissions): bool
    {
        if (!Auth::check()) {
            return false;
        }

        return Auth::user()->hasAnyPermission($permissions);
    }

    /**
     * Check if current user has all of the given permissions
     */
    public static function hasAllPermissions(array $permissions): bool
    {
        if (!Auth::check()) {
            return false;
        }

        return Auth::user()->hasAllPermissions($permissions);
    }

    /**
     * Check if current user has role
     */
    public static function hasRole(string $role): bool
    {
        if (!Auth::check()) {
            return false;
        }

        return Auth::user()->hasRole($role);
    }

    /**
     * Check if current user has any of the given roles
     */
    public static function hasAnyRole(array $roles): bool
    {
        if (!Auth::check()) {
            return false;
        }

        return Auth::user()->hasAnyRole($roles);
    }

    /**
     * Get all permissions for current user
     */
    public static function getUserPermissions(): array
    {
        if (!Auth::check()) {
            return [];
        }

        return Auth::user()->getAllPermissions()->pluck('name')->toArray();
    }

    /**
     * Get all roles for current user
     */
    public static function getUserRoles(): array
    {
        if (!Auth::check()) {
            return [];
        }

        return Auth::user()->getRoleNames()->toArray();
    }

    /**
     * Check if user can perform CRUD operations on a resource
     */
    public static function canManageResource(string $resource): array
    {
        return [
            'view' => self::hasPermission("{$resource}.view"),
            'create' => self::hasPermission("{$resource}.create"),
            'edit' => self::hasPermission("{$resource}.edit"),
            'delete' => self::hasPermission("{$resource}.delete"),
        ];
    }

    /**
     * Get permission groups for better organization
     */
    public static function getPermissionGroups(): array
    {
        return [
            'User Management' => [
                'users.view',
                'users.create',
                'users.edit',
                'users.delete',
                'users.assign-roles',
                'users.bulk-operations',
            ],
            'Role & Permission Management' => [
                'roles.view',
                'roles.create',
                'roles.edit',
                'roles.delete',
                'roles.bulk-operations',
                'permissions.view',
                'permissions.create',
                'permissions.edit',
                'permissions.delete',
                'permissions.bulk-operations',
            ],
            'Transaction Management' => [
                'transactions.view',
                'transactions.view-own',
                'transactions.create',
                'transactions.edit',
                'transactions.delete',
                'transactions.approve',
                'transactions.reject',
                'transactions.deposit',
                'transactions.withdrawal',
                'transactions.bulk-operations',
            ],
            'TikTok Account Management' => [
                'tiktok-accounts.view',
                'tiktok-accounts.create',
                'tiktok-accounts.edit',
                'tiktok-accounts.delete',
                'tiktok-accounts.import',
                'tiktok-accounts.bulk-operations',
            ],
            'Content Management' => [
                'interaction-scenarios.view',
                'interaction-scenarios.create',
                'interaction-scenarios.edit',
                'interaction-scenarios.delete',
                'scenario-scripts.view',
                'scenario-scripts.create',
                'scenario-scripts.edit',
                'scenario-scripts.delete',
                'account-tasks.view',
                'account-tasks.create',
                'account-tasks.edit',
                'account-tasks.delete',
                'content-groups.view',
                'content-groups.create',
                'content-groups.edit',
                'content-groups.delete',
                'content-groups.bulk-operations',
                'contents.view',
                'contents.create',
                'contents.edit',
                'contents.delete',
                'contents.bulk-operations',
            ],
            'System Management' => [
                'devices.view',
                'devices.create',
                'devices.edit',
                'devices.delete',
                'notifications.view',
                'notifications.create',
                'notifications.edit',
                'notifications.delete',
                'notifications.bulk-operations',
                'settings.view',
                'settings.edit',
            ],
            'Analytics & Reports' => [
                'analytics.view',
                'analytics.transactions',
                'ai-spending.view',
                'ai-spending.view-own',
            ],
        ];
    }

    /**
     * Check if user is admin (has admin or super-admin role)
     */
    public static function isAdmin(): bool
    {
        return self::hasAnyRole(['admin', 'super-admin']);
    }

    /**
     * Check if user is super admin
     */
    public static function isSuperAdmin(): bool
    {
        return self::hasRole('super-admin');
    }

    /**
     * Get formatted permissions for API response
     */
    public static function getFormattedUserPermissions(): array
    {
        if (!Auth::check()) {
            return [];
        }

        $user = Auth::user();
        $permissions = $user->getAllPermissions();
        $roles = $user->getRoleNames();

        return [
            'roles' => $roles->toArray(),
            'permissions' => $permissions->pluck('name')->toArray(),
            'permission_groups' => self::getUserPermissionsByGroup(),
        ];
    }

    /**
     * Get user permissions organized by groups
     */
    public static function getUserPermissionsByGroup(): array
    {
        $userPermissions = self::getUserPermissions();
        $groups = self::getPermissionGroups();
        $result = [];

        foreach ($groups as $groupName => $groupPermissions) {
            $result[$groupName] = array_intersect($userPermissions, $groupPermissions);
        }

        return array_filter($result); // Remove empty groups
    }
}
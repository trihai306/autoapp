<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use App\Models\User;

class RolePermissionSeeder extends Seeder
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

        // create permissions
        Permission::firstOrCreate(['name' => 'create users', 'guard_name' => 'sanctum']);
        Permission::firstOrCreate(['name' => 'read users', 'guard_name' => 'sanctum']);
        Permission::firstOrCreate(['name' => 'update users', 'guard_name' => 'sanctum']);
        Permission::firstOrCreate(['name' => 'delete users', 'guard_name' => 'sanctum']);

        Permission::firstOrCreate(['name' => 'create roles', 'guard_name' => 'sanctum']);
        Permission::firstOrCreate(['name' => 'read roles', 'guard_name' => 'sanctum']);
        Permission::firstOrCreate(['name' => 'update roles', 'guard_name' => 'sanctum']);
        Permission::firstOrCreate(['name' => 'delete roles', 'guard_name' => 'sanctum']);

        Permission::firstOrCreate(['name' => 'create permissions', 'guard_name' => 'sanctum']);
        Permission::firstOrCreate(['name' => 'read permissions', 'guard_name' => 'sanctum']);

        // create roles and assign created permissions
        $userRole = Role::firstOrCreate(['name' => 'user', 'guard_name' => 'sanctum']);
        
        $adminRole = Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'sanctum']);
        $adminRole->givePermissionTo(Permission::all());

        // assign roles to existing users
        $adminUser = User::where('email', 'admin@example.com')->first();
        if ($adminUser) {
            $adminUser->assignRole($adminRole);
        }

        $users = User::where('email', '!=', 'admin@example.com')->get();
        foreach ($users as $user) {
            $user->assignRole($userRole);
        }
    }
}

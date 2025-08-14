<?php

namespace App\Repositories;

use Spatie\Permission\Models\Role;

interface RoleRepositoryInterface extends BaseRepositoryInterface
{
    public function syncPermissions(Role $role, array $permissionIds): void;
    public function getRoleByName(string $name): ?Role;
    public function deleteByIds(array $ids): int;
}

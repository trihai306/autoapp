<?php

namespace App\Repositories\Eloquent;

use App\Repositories\RoleRepositoryInterface;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use App\Repositories\Eloquent\BaseRepository;

class RoleRepository extends BaseRepository implements RoleRepositoryInterface
{
    public function __construct(Role $model)
    {
        parent::__construct($model);
    }

    public function syncPermissions(Role $role, array $permissionIds): void
    {
        $permissions = Permission::whereIn('id', $permissionIds)->get();
        $role->syncPermissions($permissions);
    }

    public function getRoleByName(string $name): ?Role
    {
        return $this->model->where('name', $name)->first();
    }

    public function all()
    {
        return $this->model->with('permissions')->get();
    }

    public function deleteByIds(array $ids): int
    {
        return $this->model->whereIn('id', $ids)->delete();
    }
}

<?php

namespace App\Services;

use App\Models\Role;
use App\Queries\BaseQuery;
use App\Repositories\RoleRepositoryInterface;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

class RoleService
{
    protected $roleRepository;

    public function __construct(RoleRepositoryInterface $roleRepository)
    {
        $this->roleRepository = $roleRepository;
    }

    public function getAllRoles(Request $request)
    {
        $query = $this->roleRepository->getModel()->query();

        if (!$request->has('sort')) {
            $query->latest();
        }

        return BaseQuery::for($query, $request)->paginate();
    }

    public function createRole(array $data): Role
    {
        $validator = Validator::make($data, [
            'name' => 'required|string|unique:roles,name',
            'permissions' => 'array',
            'permissions.*' => 'string|exists:permissions,name'
        ]);

        if ($validator->fails()) {
            throw new ValidationException($validator);
        }

        $role = $this->roleRepository->create(['name' => $data['name']]);

        if (!empty($data['permissions'])) {
            $role->syncPermissions($data['permissions']);
        }

        return $role->load('permissions');
    }

    public function getRoleById(int $id): ?Role
    {
        return $this->roleRepository->find($id)?->load('permissions');
    }

    public function updateRole(Role $role, array $data): Role
    {
        $validator = Validator::make($data, [
            'name' => 'sometimes|required|string|unique:roles,name,' . $role->id,
            'permissions' => 'sometimes|array',
            'permissions.*' => 'string|exists:permissions,name'
        ]);

        if ($validator->fails()) {
            throw new ValidationException($validator);
        }

        if (isset($data['name'])) {
            $this->roleRepository->update($role, ['name' => $data['name']]);
        }

        if (isset($data['permissions'])) {
            $role->syncPermissions($data['permissions']);
        }

        return $role->fresh()->load('permissions');
    }

    public function deleteRole(Role $role): bool
    {
        if (in_array($role->name, ['admin', 'super-admin'])) {
            throw new \Exception('Cannot delete the protected roles.');
        }

        return $this->roleRepository->delete($role);
    }

    public function deleteMultipleRoles(array $ids): int
    {
        // Add any business logic here, e.g., preventing deletion of protected roles
        $protectedRoles = Role::whereIn('id', $ids)->whereIn('name', ['admin', 'super-admin'])->count();
        if ($protectedRoles > 0) {
            throw new \Exception('Cannot delete protected roles.');
        }
        return $this->roleRepository->deleteByIds($ids);
    }

    public function getStatistics(): array
    {
        $totalRoles = Role::count();
        $totalPermissions = Role::with('permissions')->get()->sum(function ($role) {
            return $role->permissions->count();
        });
        $usersWithRoles = \App\Models\User::whereHas('roles')->count();
        $recentlyCreated = Role::where('created_at', '>=', now()->subDays(7))->count();

        return [
            'totalRoles' => $totalRoles,
            'totalPermissions' => $totalPermissions,
            'usersWithRoles' => $usersWithRoles,
            'recentlyCreated' => $recentlyCreated,
        ];
    }
}

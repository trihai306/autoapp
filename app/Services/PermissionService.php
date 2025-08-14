<?php

namespace App\Services;

use App\Queries\BaseQuery;
use App\Repositories\PermissionRepositoryInterface;
use Illuminate\Http\Request;

class PermissionService
{
    protected $permissionRepository;

    public function __construct(PermissionRepositoryInterface $permissionRepository)
    {
        $this->permissionRepository = $permissionRepository;
    }

    public function getAllPermissions(Request $request)
    {
        $query = $this->permissionRepository->getModel()->query();

        if (!$request->has('sort')) {
            $query->latest();
        }

        return BaseQuery::for($query, $request)->paginate();
    }

    public function getPermissionById(int $id): ?\App\Models\Permission
    {
        return $this->permissionRepository->find($id);
    }

    public function deletePermission(int $id): bool
    {
        return $this->permissionRepository->delete($id);
    }

    public function deleteMultiplePermissions(array $ids): int
    {
        return $this->permissionRepository->deleteByIds($ids);
    }

    public function createPermission(array $data): \App\Models\Permission
    {
        return $this->permissionRepository->create($data);
    }

    public function updatePermission(\App\Models\Permission $permission, array $data): bool
    {
        return $this->permissionRepository->update($permission, $data);
    }
}

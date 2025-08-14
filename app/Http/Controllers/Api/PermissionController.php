<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\PermissionService;
use Dedoc\Scramble\Attributes\Group;
use Dedoc\Scramble\Attributes\QueryParameter;
use Illuminate\Http\Request;

/**
 * @authenticated
 */
#[Group('Roles & Permissions')]
class PermissionController extends Controller
{
    protected $permissionService;

    public function __construct(PermissionService $permissionService)
    {
        $this->permissionService = $permissionService;
        // $this->middleware('role:admin');
    }

    /**
     * List all available permissions
     *
     * Retrieve a paginated list of permissions.
     * Supports searching and sorting.
     *
     * @response \Illuminate\Pagination\LengthAwarePaginator<App\Models\Permission>
     */
    #[QueryParameter('search', description: 'Search for permissions by name.', example: 'edit')]
    #[QueryParameter('sort', description: 'Sort by `name` or `created_at`. Prefix with `-` for descending.', example: '-created_at')]
    #[QueryParameter('page', description: 'The page number for pagination.', example: 1)]
    #[QueryParameter('per_page', description: 'The number of items per page.', example: 15)]
    public function index(Request $request)
    {
        return response()->json($this->permissionService->getAllPermissions($request));
    }

    /**
     * Create a new permission
     * @response \App\Models\Permission
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|unique:permissions,name',
        ]);

        $permission = $this->permissionService->createPermission($validated);
        return response()->json($permission, 201);
    }

    /**
     * Get a specific permission
     * @response \App\Models\Permission
     */
    public function show(int $id)
    {
        $permission = $this->permissionService->getPermissionById($id);
        return response()->json($permission);
    }

    /**
     * Update a permission
     * @response \App\Models\Permission
     */
    public function update(Request $request, \App\Models\Permission $permission)
    {
        $validated = $request->validate([
            'name' => 'required|string|unique:permissions,name,' . $permission->id,
        ]);

        $this->permissionService->updatePermission($permission, $validated);
        return response()->json($permission->fresh());
    }

    public function destroy(int $id)
    {
        $this->permissionService->deletePermission($id);
        return response()->json(null, 204);
    }

    public function bulkDelete(Request $request)
    {
        $validated = $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:permissions,id',
        ]);

        $count = $this->permissionService->deleteMultiplePermissions($validated['ids']);
        return response()->json(['message' => "Successfully deleted {$count} permissions."]);
    }
}

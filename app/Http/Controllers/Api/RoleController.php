<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Services\RoleService;
use Dedoc\Scramble\Attributes\Group;
use Dedoc\Scramble\Attributes\QueryParameter;
use Illuminate\Http\Request;

/**
 * @authenticated
 */
#[Group('Roles & Permissions')]
class RoleController extends Controller
{
    protected $roleService;

    public function __construct(RoleService $roleService)
    {
        $this->roleService = $roleService;
        // $this->middleware('role:admin');
    }

    /**
     * List all roles
     *
     * Retrieve a paginated list of roles.
     * Supports searching and sorting.
     *
     * @response \Illuminate\Pagination\LengthAwarePaginator<App\Models\Role>
     */
    #[QueryParameter('search', description: 'Search for roles by name.', example: 'admin')]
    #[QueryParameter('sort', description: 'Sort by `name` or `created_at`. Prefix with `-` for descending.', example: '-name')]
    #[QueryParameter('page', description: 'The page number for pagination.', example: 1)]
    #[QueryParameter('per_page', description: 'The number of items per page.', example: 15)]
    public function index(Request $request)
    {
        return response()->json($this->roleService->getAllRoles($request));
    }

    /**
     * Create a new role
     *
     * Creates a new role and optionally assigns permissions to it.
     * @response \App\Models\Role
     */
    public function store(Request $request)
    {
        $role = $this->roleService->createRole($request->all());
        return response()->json($role, 201);
    }

    /**
     * Get a specific role
     *
     * @param Role $role The role model instance.
     * @response \App\Models\Role
     */
    public function show(Role $role)
    {
        return response()->json($this->roleService->getRoleById($role->id));
    }

    /**
     * Update a role
     *
     * @param Role $role The role model instance.
     * @response \App\Models\Role
     */
    public function update(Request $request, Role $role)
    {
        $updatedRole = $this->roleService->updateRole($role, $request->all());
        return response()->json($updatedRole);
    }

    /**
     * Delete a role
     *
     * @param Role $role The role model instance.
     */
    public function destroy(Role $role)
    {
        $this->roleService->deleteRole($role);
        return response()->json(null, 204);
    }

    /**
     * Delete multiple roles
     */
    public function bulkDelete(Request $request)
    {
        $validated = $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:roles,id',
        ]);

        try {
            $count = $this->roleService->deleteMultipleRoles($validated['ids']);
            return response()->json(['message' => "Successfully deleted {$count} roles."]);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    /**
     * Get role statistics
     *
     * Retrieves statistical data about roles including totals, permissions count, 
     * users with roles, and recent activity.
     * 
     * @response {
     *   "data": {
     *     "totalRoles": 12,
     *     "totalPermissions": 45,
     *     "usersWithRoles": 156,
     *     "recentlyCreated": 3
     *   }
     * }
     */
    public function stats(Request $request)
    {
        $stats = $this->roleService->getStatistics();
        
        return response()->json([
            'data' => $stats
        ]);
    }
}

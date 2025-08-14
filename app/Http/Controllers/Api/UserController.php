<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\UserService;
use Dedoc\Scramble\Attributes\Group;
use Dedoc\Scramble\Attributes\QueryParameter;
use Illuminate\Http\Request;
use Illuminate\Validation\Rules;

/**
 * APIs for managing users. Requires admin privileges.
 * @authenticated
 */
#[Group('User Management')]
class UserController extends Controller
{
    protected $userService;

    public function __construct(UserService $userService)
    {
        $this->userService = $userService;
        // Permission middleware is now handled in routes
    }

    /**
     * List all users
     *
     * Retrieve a paginated list of all registered users.
     * Supports searching, filtering, and sorting.
     *
     * @response \Illuminate\Pagination\LengthAwarePaginator<App\Models\User>
     */
    #[QueryParameter('search', description: 'A search term to filter users by name, first_name, last_name, email, or phone_number.', example: 'john')]
    #[QueryParameter('filter[email]', description: 'Filter users by a specific email address.', example: 'john.doe@example.com')]
    #[QueryParameter('filter[first_name]', description: 'Filter users by first name.', example: 'John')]
    #[QueryParameter('filter[last_name]', description: 'Filter users by last name.', example: 'Doe')]
    #[QueryParameter('filter[phone_number]', description: 'Filter users by phone number.', example: '0987654321')]
    #[QueryParameter('filter[status]', description: 'Filter users by status (active or locked).', example: 'active')]
    #[QueryParameter('sort', description: 'Sort users by `name`, `email`, `first_name`, `last_name`, `phone_number`, `created_at`. Prefix with `-` for descending.', example: '-created_at')]
    #[QueryParameter('page', description: 'The page number for pagination.', example: 2)]
    #[QueryParameter('per_page', description: 'The number of items per page.', example: 25)]
    public function index(Request $request)
    {
        // A paginated list of user resources.
        return response()->json($this->userService->getAllUsers($request));
    }

    /**
     * Create a new user
     *
     * Creates a new user with the given details.
     * The new user object is returned upon successful creation.
     */
    public function store(Request $request)
    {
        // Check permission for creating users
        if (!auth()->user()->can('users.create')) {
            return response()->json(['message' => 'Forbidden. You do not have permission to create users.'], 403);
        }

        $validated = $request->validate([
            /**
             * The name of the user.
             * @example John Doe
             */
            'name' => ['required', 'string', 'max:255'],
            /**
             * The first name of the user.
             * @example John
             */
            'first_name' => ['required', 'string', 'max:255'],
            /**
             * The last name of the user.
             * @example Doe
             */
            'last_name' => ['required', 'string', 'max:255'],
            /**
             * The email of the user. Must be unique.
             * @example john.doe@example.com
             */
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            /**
             * The phone number of the user. Must be unique.
             * @example 0987654321
             */
            'phone_number' => ['required', 'string', 'max:255', 'unique:users'],
            /**
             * The password for the user. Minimum 8 characters.
             * It will be confirmed with `password_confirmation` field.
             * @example password123
             */
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'roles' => ['sometimes', 'array'],
            'roles.*' => ['integer', 'exists:roles,id'],
        ]);

        $user = $this->userService->createUser($validated);

        // The newly created user resource.
        return response()->json($user, 201);
    }

    /**
     * Get a specific user
     *
     * Retrieves the details of a specific user by their ID.
     * @param  User  $user The user model instance.
     */
    public function show(User $user)
    {
        // The requested user resource.
        return response()->json($user->load('roles'));
    }

    /**
     * Update a user
     *
     * Updates the details of a specific user.
     * @param  User  $user The user to update.
     */
    public function update(Request $request, User $user)
    {
        // Check permission for editing users
        if (!auth()->user()->can('users.edit')) {
            return response()->json(['message' => 'Forbidden. You do not have permission to edit users.'], 403);
        }

        $validated = $request->validate([
            /**
             * The new name of the user.
             * @example Jane Doe
             */
            'name' => 'sometimes|string|max:255',
            /**
             * The new first name of the user.
             * @example Jane
             */
            'first_name' => 'sometimes|string|max:255',
            /**
             * The new last name of the user.
             * @example Doe
             */
            'last_name' => 'sometimes|string|max:255',
            /**
             * The new email of the user. Must be unique.
             * @example jane.doe@example.com
             */
            'email' => 'sometimes|string|email|max:255|unique:users,email,'.$user->id,
            /**
             * The new phone number of the user. Must be unique.
             * @example 0123456789
             */
            'phone_number' => 'sometimes|string|max:255|unique:users,phone_number,'.$user->id,
            /**
             * The new password for the user. Minimum 8 characters.
             * It will be confirmed with `password_confirmation` field.
             * @example new_password_123
             */
            'password' => ['sometimes', 'confirmed', Rules\Password::defaults()],
            'roles' => ['sometimes', 'array'],
            'roles.*' => ['integer', 'exists:roles,id'],
        ]);

        $updatedUser = $this->userService->updateUser($user, $validated);

        // The updated user resource.
        return response()->json($updatedUser);
    }

    /**
     * Delete a user
     *
     * Deletes a specific user.
     * @param  User  $user The user to delete.
     */
    public function destroy(User $user)
    {
        // Check permission for deleting users
        if (!auth()->user()->can('users.delete')) {
            return response()->json(['message' => 'Forbidden. You do not have permission to delete users.'], 403);
        }

        $this->userService->deleteUser($user);

        return response()->json(null, 204);
    }

    /**
     * Assign roles to a user
     *
     * Assigns a specific role to a user. This action may require admin privileges.
     * @param  User  $user The user to whom the role is assigned.
     * @throws \Illuminate\Auth\Access\AuthorizationException
     */
    public function assignRole(Request $request, User $user)
    {
        // Note: You should implement authorization logic here.
        // For example: $this->authorize('assign role', $user);

        $validated = $request->validate([
            /**
             * The name of the role to assign.
             * @example admin
             */
            'roles' => 'required|array',
            'roles.*' => 'string|exists:roles,name',
        ]);

        $this->userService->assignRolesToUser($user, $validated['roles']);

        return response()->json(['message' => 'Role assigned successfully.']);
    }

    /**
     * Delete multiple users
     *
     * Deletes a list of users by their IDs.
     */
    public function bulkDelete(Request $request)
    {
        $validated = $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:users,id',
        ]);

        $count = $this->userService->deleteMultiple($validated['ids']);

        return response()->json(['message' => "Successfully deleted {$count} users."]);
    }

    /**
     * Update status for multiple users
     *
     * Updates the status (e.g., 'active', 'locked') for a list of users.
     */
    public function bulkUpdateStatus(Request $request)
    {
        $validated = $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:users,id',
            'status' => 'required|string|in:active,locked',
        ]);

        $count = $this->userService->updateStatusMultiple($validated['ids'], $validated['status']);

        return response()->json(['message' => "Successfully updated {$count} users to status '{$validated['status']}'."]);
    }

    /**
     * Get user statistics
     *
     * Retrieves statistical data about users including totals, active/locked counts, 
     * recent registrations, total balance, and users with roles.
     * 
     * @response {
     *   "data": {
     *     "totalUsers": 1250,
     *     "activeUsers": 1180,
     *     "lockedUsers": 70,
     *     "recentUsers": 25,
     *     "totalBalance": 125000.50,
     *     "usersWithRoles": 890
     *   }
     * }
     */
    public function stats(Request $request)
    {
        $stats = $this->userService->getStatistics();
        
        return response()->json([
            'data' => $stats
        ]);
    }
}

<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\InteractionScenario;
use App\Services\InteractionScenarioService;
use Dedoc\Scramble\Attributes\Group;
use Illuminate\Http\Request;

/**
 * APIs for managing Interaction Scenarios.
 * @authenticated
 */
#[Group('Interaction Scenario Management')]
class InteractionScenarioController extends Controller
{
    protected $interactionScenarioService;

    public function __construct(InteractionScenarioService $interactionScenarioService)
    {
        $this->interactionScenarioService = $interactionScenarioService;
    }

    /**
     * List all interaction scenarios
     *
     * Retrieve a paginated list of all interaction scenarios.
     * Supports searching, filtering, and sorting.
     * Admin can see all scenarios, regular users can only see their own scenarios.
     *
     * @response \Illuminate\Pagination\LengthAwarePaginator<App\Models\InteractionScenario>
     */
    public function index(Request $request)
    {
        $user = $request->user();
        
        // Nếu user là admin, hiển thị tất cả scenarios
        if ($user->hasRole('admin')) {
            return response()->json($this->interactionScenarioService->getAll($request));
        }
        
        // Nếu không phải admin, chỉ hiển thị scenarios của user đó
        $request->merge(['user_id' => $user->id]);
        return response()->json($this->interactionScenarioService->getAll($request));
    }

    /**
     * Create a new interaction scenario
     *
     * Creates a new interaction scenario with the given details.
     * Admin can create scenarios for any user, regular users can only create for themselves.
     */
    public function store(Request $request)
    {
        $user = $request->user();
        
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'shuffle_actions' => 'sometimes|boolean',
            'run_count' => 'sometimes|boolean',
            'from_count' => 'sometimes|integer|min:1',
            'to_count' => 'sometimes|integer|min:1',
            'status' => 'sometimes|in:active,inactive,draft',
            'settings' => 'nullable|json',
        ]);

        // Kiểm tra quyền: chỉ admin mới có thể tạo scenario cho user khác
        if (!$user->hasRole('admin') && $validated['user_id'] != $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $scenario = $this->interactionScenarioService->create($validated);

        return response()->json($scenario, 201);
    }

    /**
     * Get a specific interaction scenario
     *
     * Retrieves the details of a specific interaction scenario by its ID.
     * Admin can see any scenario, regular users can only see their own scenarios.
     */
    public function show(Request $request, InteractionScenario $interactionScenario)
    {
        $user = $request->user();
        
        // Kiểm tra quyền: chỉ admin hoặc chủ sở hữu mới có thể xem
        if (!$user->hasRole('admin') && $interactionScenario->user_id != $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return response()->json($interactionScenario->load('scripts'));
    }

    /**
     * Update an interaction scenario
     *
     * Updates the details of a specific interaction scenario.
     * Admin can update any scenario, regular users can only update their own scenarios.
     */
    public function update(Request $request, InteractionScenario $interactionScenario)
    {
        $user = $request->user();
        
        // Kiểm tra quyền: chỉ admin hoặc chủ sở hữu mới có thể cập nhật
        if (!$user->hasRole('admin') && $interactionScenario->user_id != $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'shuffle_actions' => 'sometimes|boolean',
            'run_count' => 'sometimes|boolean',
            'from_count' => 'sometimes|integer|min:1',
            'to_count' => 'sometimes|integer|min:1',
            'status' => 'sometimes|in:active,inactive,draft',
            'settings' => 'nullable|json',
        ]);

        $updatedScenario = $this->interactionScenarioService->update($interactionScenario, $validated);

        return response()->json($updatedScenario);
    }

    /**
     * Delete an interaction scenario
     *
     * Deletes a specific interaction scenario.
     * Admin can delete any scenario, regular users can only delete their own scenarios.
     */
    public function destroy(Request $request, InteractionScenario $interactionScenario)
    {
        $user = $request->user();
        
        // Kiểm tra quyền: chỉ admin hoặc chủ sở hữu mới có thể xóa
        if (!$user->hasRole('admin') && $interactionScenario->user_id != $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $this->interactionScenarioService->delete($interactionScenario);

        return response()->json(null, 204);
    }
}

<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ScenarioScript;
use App\Services\ScenarioScriptService;
use Dedoc\Scramble\Attributes\Group;
use Illuminate\Http\Request;

/**
 * APIs for managing Scenario Scripts.
 * @authenticated
 */
#[Group('Scenario Script Management')]
class ScenarioScriptController extends Controller
{
    protected $scenarioScriptService;

    public function __construct(ScenarioScriptService $scenarioScriptService)
    {
        $this->scenarioScriptService = $scenarioScriptService;
    }

    /**
     * List all scenario scripts
     *
     * Retrieve a paginated list of all scenario scripts.
     * Supports searching, filtering, and sorting.
     * Admin can see all scripts, regular users can only see scripts from their own scenarios.
     *
     * @response \Illuminate\Pagination\LengthAwarePaginator<App\Models\ScenarioScript>
     */
    public function index(Request $request)
    {
        $user = $request->user();
        
        // Nếu user là admin, hiển thị tất cả scripts
        if ($user->hasRole('admin')) {
            return response()->json($this->scenarioScriptService->getAll($request));
        }
        
        // Nếu không phải admin, chỉ hiển thị scripts từ scenarios của user đó
        $request->merge(['user_id' => $user->id]);
        return response()->json($this->scenarioScriptService->getAll($request));
    }

    /**
     * Create a new scenario script
     *
     * Creates a new scenario script with the given details.
     * Admin can create scripts for any scenario, regular users can only create for their own scenarios.
     */
    public function store(Request $request)
    {
        $user = $request->user();
        
        $validated = $request->validate([
            'scenario_id' => 'required|exists:interaction_scenarios,id',
            'order' => 'sometimes|integer|min:0',
            'script' => 'required|json',
        ]);

        // Kiểm tra quyền: chỉ admin hoặc chủ sở hữu scenario mới có thể tạo script
        $scenario = \App\Models\InteractionScenario::find($validated['scenario_id']);
        if (!$user->hasRole('admin') && $scenario->user_id != $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $script = $this->scenarioScriptService->create($validated);

        return response()->json($script, 201);
    }

    /**
     * Get a specific scenario script
     *
     * Retrieves the details of a specific scenario script by its ID.
     * Admin can see any script, regular users can only see scripts from their own scenarios.
     */
    public function show(Request $request, ScenarioScript $scenarioScript)
    {
        $user = $request->user();
        
        // Kiểm tra quyền: chỉ admin hoặc chủ sở hữu scenario mới có thể xem
        if (!$user->hasRole('admin') && $scenarioScript->scenario->user_id != $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return response()->json($scenarioScript);
    }

    /**
     * Update a scenario script
     *
     * Updates the details of a specific scenario script.
     * Admin can update any script, regular users can only update scripts from their own scenarios.
     */
    public function update(Request $request, ScenarioScript $scenarioScript)
    {
        $user = $request->user();
        
        // Kiểm tra quyền: chỉ admin hoặc chủ sở hữu scenario mới có thể cập nhật
        if (!$user->hasRole('admin') && $scenarioScript->scenario->user_id != $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'order' => 'sometimes|integer|min:0',
            'script' => 'sometimes|json',
        ]);

        $updatedScript = $this->scenarioScriptService->update($scenarioScript, $validated);

        return response()->json($updatedScript);
    }

    /**
     * Delete a scenario script
     *
     * Deletes a specific scenario script.
     * Admin can delete any script, regular users can only delete scripts from their own scenarios.
     */
    public function destroy(Request $request, ScenarioScript $scenarioScript)
    {
        $user = $request->user();
        
        // Kiểm tra quyền: chỉ admin hoặc chủ sở hữu scenario mới có thể xóa
        if (!$user->hasRole('admin') && $scenarioScript->scenario->user_id != $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $this->scenarioScriptService->delete($scenarioScript);

        return response()->json(null, 204);
    }
}

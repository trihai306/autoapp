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
     *
     * @response \Illuminate\Pagination\LengthAwarePaginator<App\Models\ScenarioScript>
     */
    public function index(Request $request)
    {
        return response()->json($this->scenarioScriptService->getAll($request));
    }

    /**
     * Create a new scenario script
     *
     * Creates a new scenario script with the given details.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'scenario_id' => 'required|exists:interaction_scenarios,id',
            'order' => 'sometimes|integer|min:0',
            'script' => 'required|json',
        ]);

        $script = $this->scenarioScriptService->create($validated);

        return response()->json($script, 201);
    }

    /**
     * Get a specific scenario script
     *
     * Retrieves the details of a specific scenario script by its ID.
     */
    public function show(ScenarioScript $scenarioScript)
    {
        return response()->json($scenarioScript);
    }

    /**
     * Update a scenario script
     *
     * Updates the details of a specific scenario script.
     */
    public function update(Request $request, ScenarioScript $scenarioScript)
    {
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
     */
    public function destroy(ScenarioScript $scenarioScript)
    {
        $this->scenarioScriptService->delete($scenarioScript);

        return response()->json(null, 204);
    }
}

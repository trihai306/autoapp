<?php

namespace App\Services;

use App\Models\AccountTask;
use App\Queries\BaseQuery;
use App\Repositories\AccountTaskRepositoryInterface;
use App\Events\TaskDispatchedToDevice;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;

class AccountTaskService
{
    protected $accountTaskRepository;

    public function __construct(AccountTaskRepositoryInterface $accountTaskRepository)
    {
        $this->accountTaskRepository = $accountTaskRepository;
    }

    public function getAll(Request $request): LengthAwarePaginator
    {
        $query = $this->accountTaskRepository->getModel()->query();
        return BaseQuery::for($query, $request)->paginate();
    }

    public function getById(int $id): ?AccountTask
    {
        return $this->accountTaskRepository->find($id);
    }

    public function create(array $data): AccountTask
    {
        return $this->accountTaskRepository->create($data);
    }

    public function update(AccountTask $accountTask, array $data): AccountTask
    {
        $this->accountTaskRepository->update($accountTask, $data);
        return $accountTask->fresh();
    }

    public function delete(AccountTask $accountTask): bool
    {
        return $this->accountTaskRepository->delete($accountTask);
    }

    /**
     * Create pending account tasks for given TikTok account from its linked scenario scripts.
     * Returns a summary object with account info and scenario scripts used, similar to FE expectation.
     */
    public function createTasksFromScenario(\App\Models\TiktokAccount $account, ?int $deviceId, int $createdByUserId): array
    {
        // Load scenario with scripts
        $scenario = $account->interactionScenario()->with('scripts')->first();
        if (!$scenario) {
            return [
                'success' => false,
                'message' => 'No linked scenario found for this account.',
            ];
        }

        $scripts = $scenario->scripts;
        if ($scripts->isEmpty()) {
            return [
                'success' => false,
                'message' => 'Scenario has no scripts.',
            ];
        }

        // Build the complete payload structure first
        $scenarioScripts = $scripts->map(function($scriptModel, $idx) {
            // Decode JSON string if needed
            $scriptData = $scriptModel->script;
            if (is_string($scriptData)) {
                $scriptData = json_decode($scriptData, true) ?? [];
            } else {
                $scriptData = $scriptData ?? [];
            }
            $s = $scriptData;
            $params = $s['parameters'] ?? $s;
            return [
                'id' => $scriptModel->id,
                'type' => $s['type'] ?? ($s['task_type'] ?? 'unknown'),
                'name' => $s['name'] ?? ($s['type'] ?? 'unknown'),
                'description' => $s['description'] ?? null,
                'order' => $scriptModel->order ?? ($idx + 1),
                'is_active' => $s['is_active'] ?? true,
                'delay_min' => $s['delay_min'] ?? null,
                'delay_max' => $s['delay_max'] ?? null,
                'parameters' => $params,
                'success_count' => 0,
                'failure_count' => 0,
                'last_executed_at' => null,
                'success_rate' => 0,
            ];
        })->values()->all();

        $completePayload = [
            'account_username' => $account->username,
            'scenario_name' => $scenario->name,
            'device_id' => $deviceId,
            'created_by' => $createdByUserId,
            'scenario_scripts' => $scenarioScripts,
        ];

        $createdTasks = [];
        $order = 1;
        foreach ($scripts as $scriptModel) {
            // Decode JSON string if needed
            $scriptData = $scriptModel->script;
            if (is_string($scriptData)) {
                $scriptData = json_decode($scriptData, true) ?? [];
            } else {
                $scriptData = $scriptData ?? [];
            }
            $script = $scriptData;
            $taskType = $script['type'] ?? ($script['task_type'] ?? 'unknown');

            $taskData = [
                'tiktok_account_id' => $account->id,
                'interaction_scenario_id' => $scenario->id,
                'device_id' => $deviceId,
                'task_type' => $taskType,
                'parameters' => json_encode($completePayload), // Store complete payload
                'priority' => 'medium',
                'status' => 'pending',
                'scheduled_at' => null,
            ];

            // Debug logging
            \Log::info('Creating AccountTask with data:', $taskData);
            
            try {
                $task = $this->accountTaskRepository->create($taskData);
                $createdTasks[] = $task;
                
                // Dispatch event for real-time updates
                event(new TaskDispatchedToDevice($task));
                \Log::info('TaskDispatchedToDevice event fired for task:', ['task_id' => $task->id, 'device_key' => $task->device_id]);
            } catch (\Exception $e) {
                \Log::error('Failed to create AccountTask:', ['error' => $e->getMessage(), 'data' => $taskData]);
                throw $e;
            }
            $order++;
        }

        return $completePayload;
    }
}

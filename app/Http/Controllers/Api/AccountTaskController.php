<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AccountTask;
use App\Services\AccountTaskService;
use Dedoc\Scramble\Attributes\Group;
use Dedoc\Scramble\Attributes\QueryParameter;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

/**
 * APIs for managing Account Tasks.
 * @authenticated
 */
#[Group('Account Task Management')]
class AccountTaskController extends Controller
{
    protected $accountTaskService;

    public function __construct(AccountTaskService $accountTaskService)
    {
        $this->accountTaskService = $accountTaskService;
    }

    /**
     * List all account tasks
     *
     * Retrieve a paginated list of all account tasks.
     * Supports searching, filtering, and sorting.
     * Admin can see all tasks, regular users can only see tasks from their own accounts.
     *
     * @response \Illuminate\Pagination\LengthAwarePaginator<App\Models\AccountTask>
     */
    #[QueryParameter('search', description: 'Search account tasks by task_type, error_message, status, or priority.', example: 'follow')]
    #[QueryParameter('filter[tiktok_account_id]', description: 'Filter tasks by TikTok account ID.', example: 1)]
    #[QueryParameter('filter[interaction_scenario_id]', description: 'Filter tasks by interaction scenario ID.', example: 2)]
    #[QueryParameter('filter[device_id]', description: 'Filter tasks by device ID.', example: 3)]
    #[QueryParameter('filter[task_type]', description: 'Filter tasks by task type.', example: 'follow')]
    #[QueryParameter('filter[status]', description: 'Filter tasks by status (pending, running, completed, failed).', example: 'pending')]
    #[QueryParameter('filter[priority]', description: 'Filter tasks by priority (low, medium, high).', example: 'high')]
    #[QueryParameter('sort', description: 'Sort by `id`, `priority`, `status`, `scheduled_at`, `started_at`, `completed_at`, `created_at`, `updated_at`. Prefix with `-` for descending.', example: '-created_at')]
    #[QueryParameter('page', description: 'The page number for pagination.', example: 1)]
    #[QueryParameter('per_page', description: 'The number of items per page.', example: 15)]
    public function index(Request $request)
    {
        $user = $request->user();
        
        // Xử lý tham số filter và sort
        $filters = $request->all();
        
        // Chuyển đổi filter[status] thành status nếu có
        if (isset($filters['filter']['status'])) {
            $filters['status'] = $filters['filter']['status'];
        }
        
        // Đảm bảo sắp xếp mặc định theo thời gian mới nhất
        if (!isset($filters['sort'])) {
            $filters['sort'] = '-created_at';
        }
        
        $request->merge($filters);
        
        // Nếu user là admin, hiển thị tất cả tasks
        if ($user->hasRole('admin')) {
            return response()->json($this->accountTaskService->getAll($request));
        }
        
        // Nếu không phải admin, chỉ hiển thị tasks từ accounts của user đó
        $request->merge(['user_id' => $user->id]);
        return response()->json($this->accountTaskService->getAll($request));
    }

    /**
     * Create a new account task
     *
     * Creates a new account task with the given details.
     * Admin can create tasks for any account, regular users can only create for their own accounts.
     */
    public function store(Request $request)
    {
        $user = $request->user();
        
        $validated = $request->validate([
            'tiktok_account_id' => 'required|exists:tiktok_accounts,id',
            'interaction_scenario_id' => 'nullable|exists:interaction_scenarios,id',
            'device_id' => 'nullable|exists:devices,id',
            'task_type' => 'required|string',
            'parameters' => 'nullable|json',
            'priority' => 'sometimes|in:low,medium,high',
            'status' => 'sometimes|in:pending,running,completed,failed',
            'scheduled_at' => 'nullable|date',
        ]);

        // Kiểm tra quyền: chỉ admin hoặc chủ sở hữu account mới có thể tạo task
        $account = \App\Models\TiktokAccount::find($validated['tiktok_account_id']);
        if (!$user->hasRole('admin') && $account->user_id != $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $task = $this->accountTaskService->create($validated);

        return response()->json($task, 201);
    }

    /**
     * Get a specific account task
     *
     * Retrieves the details of a specific account task by its ID.
     * Admin can see any task, regular users can only see tasks from their own accounts.
     */
    public function show(Request $request, AccountTask $accountTask)
    {
        $user = $request->user();
        
        // Kiểm tra quyền: chỉ admin hoặc chủ sở hữu account mới có thể xem
        if (!$user->hasRole('admin') && $accountTask->tiktokAccount->user_id != $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return response()->json($accountTask);
    }

    /**
     * Update an account task
     *
     * Updates the details of a specific account task.
     * Admin can update any task, regular users can only update tasks from their own accounts.
     */
    public function update(Request $request, AccountTask $accountTask)
    {
        $user = $request->user();
        
        // Kiểm tra quyền: chỉ admin hoặc chủ sở hữu account mới có thể cập nhật
        if (!$user->hasRole('admin') && $accountTask->tiktokAccount->user_id != $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'interaction_scenario_id' => 'nullable|exists:interaction_scenarios,id',
            'device_id' => 'nullable|exists:devices,id',
            'task_type' => 'sometimes|string',
            'parameters' => 'nullable|json',
            'priority' => 'sometimes|in:low,medium,high',
            'status' => 'sometimes|in:pending,running,completed,failed',
            'result' => 'nullable|json',
            'error_message' => 'nullable|string',
            'retry_count' => 'sometimes|integer',
            'max_retries' => 'sometimes|integer',
            'scheduled_at' => 'nullable|date',
            'started_at' => 'nullable|date',
            'completed_at' => 'nullable|date',
        ]);

        $updatedTask = $this->accountTaskService->update($accountTask, $validated);

        return response()->json($updatedTask);
    }

    /**
     * Delete an account task
     *
     * Deletes a specific account task.
     * Admin can delete any task, regular users can only delete tasks from their own accounts.
     */
    public function destroy(Request $request, AccountTask $accountTask)
    {
        $user = $request->user();
        
        // Kiểm tra quyền: chỉ admin hoặc chủ sở hữu account mới có thể xóa
        if (!$user->hasRole('admin') && $accountTask->tiktokAccount->user_id != $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $this->accountTaskService->delete($accountTask);

        return response()->json(null, 204);
    }

    /**
     * Delete multiple account tasks
     *
     * Deletes a list of account tasks by their IDs.
     * Admin can delete any tasks, regular users can only delete tasks from their own accounts.
     */
    public function bulkDelete(Request $request)
    {
        $user = $request->user();
        
        $validated = $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:account_tasks,id',
        ]);

        // Kiểm tra quyền cho từng task
        $tasks = AccountTask::whereIn('id', $validated['ids'])->with('tiktokAccount')->get();
        foreach ($tasks as $task) {
            if (!$user->hasRole('admin') && $task->tiktokAccount->user_id != $user->id) {
                return response()->json(['message' => 'Unauthorized to delete some tasks'], 403);
            }
        }

        $count = $this->accountTaskService->deleteMultiple($validated['ids']);

        return response()->json(['message' => "Successfully deleted {$count} account tasks."]);
    }

    /**
     * Update status for multiple account tasks
     *
     * Updates the status for a list of account tasks.
     * Admin can update any tasks, regular users can only update tasks from their own accounts.
     */
    public function bulkUpdateStatus(Request $request)
    {
        $user = $request->user();
        
        $validated = $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:account_tasks,id',
            'status' => 'required|string|in:pending,running,completed,failed',
        ]);

        // Kiểm tra quyền cho từng task
        $tasks = AccountTask::whereIn('id', $validated['ids'])->with('tiktokAccount')->get();
        foreach ($tasks as $task) {
            if (!$user->hasRole('admin') && $task->tiktokAccount->user_id != $user->id) {
                return response()->json(['message' => 'Unauthorized to update some tasks'], 403);
            }
        }

        $count = $this->accountTaskService->updateStatusMultiple($validated['ids'], $validated['status']);

        return response()->json(['message' => "Successfully updated {$count} account tasks to status '{$validated['status']}'."]);
    }

    /**
     * Get recent activities for TikTok accounts
     */
    public function getRecentActivities(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'user_id' => 'required|integer',
                'page' => 'integer|min:1',
                'per_page' => 'integer|min:1|max:100',
                'status' => 'nullable|string|in:completed,failed,running',
                'start_date' => 'nullable|date',
                'account_id' => 'nullable|integer'
            ]);

            $result = $this->accountTaskService->getRecentActivities($validated);

            if (!$result['success']) {
                return response()->json([
                    'success' => false,
                    'message' => $result['message']
                ], 500);
            }

            return response()->json([
                'success' => true,
                'data' => $result['data'],
                'message' => $result['message']
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi server: ' . $e->getMessage()
            ], 500);
        }
    }


}

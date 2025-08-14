<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TiktokAccount;
use App\Services\TiktokAccountService;
use App\Events\StopTaskOnDevice;
use Dedoc\Scramble\Attributes\Group;
use Dedoc\Scramble\Attributes\QueryParameter;
use Illuminate\Http\Request;

/**
 * APIs for managing Tiktok Accounts.
 * @authenticated
 */
#[Group('Tiktok Account Management')]
class TiktokAccountController extends Controller
{
    protected $tiktokAccountService;

    public function __construct(TiktokAccountService $tiktokAccountService)
    {
        $this->tiktokAccountService = $tiktokAccountService;
    }

    /**
     * List all tiktok accounts
     *
     * Retrieve a paginated list of all tiktok accounts.
     * Supports searching, filtering, and sorting.
     *
     * @response \Illuminate\Pagination\LengthAwarePaginator<\App\Models\TiktokAccount>
     */
    #[QueryParameter('search', description: 'A search term to filter tiktok accounts by username or email.', example: 'user123')]
    #[QueryParameter('filter[user_id]', description: 'Filter tiktok accounts by user ID.', example: 1)]
    #[QueryParameter('filter[username]', description: 'Filter tiktok accounts by username.', example: 'user123')]
    #[QueryParameter('filter[email]', description: 'Filter tiktok accounts by email.', example: 'user@example.com')]
    #[QueryParameter('filter[status]', description: 'Filter tiktok accounts by status.', example: 'active')]
    #[QueryParameter('filter[task_status]', description: 'Filter tiktok accounts by task status: pending, no_pending.', example: 'pending')]
    #[QueryParameter('filter[has_pending_tasks]', description: 'Filter accounts that have pending tasks (true/false).', example: 'true')]
    #[QueryParameter('filter[pending_task_type]', description: 'Filter accounts by pending task type.', example: 'follow_user')]
    #[QueryParameter('filter[pending_task_priority]', description: 'Filter accounts by pending task priority: low, medium, high.', example: 'high')]
    #[QueryParameter('filter[pending_task_device_id]', description: 'Filter accounts by device ID in pending tasks.', example: '123')]
    #[QueryParameter('filter[scenario_id]', description: 'Filter accounts by their assigned scenario ID.', example: '456')]
    #[QueryParameter('sort', description: 'Sort tiktok accounts by `username`, `email`, `created_at`, `pending_tasks_count`. Prefix with `-` for descending.', example: '-pending_tasks_count')]
    #[QueryParameter('page', description: 'The page number for pagination.', example: 2)]
    #[QueryParameter('per_page', description: 'The number of items per page.', example: 25)]
    public function index(Request $request)
    {
        $user = $request->user();
        
        // Nếu không phải admin, tự động filter theo user hiện tại
        if (!$user->hasRole('admin')) {
            $request->merge(['user_id' => $user->id]);
        }
        
        $result = $this->tiktokAccountService->getAll($request);
        return response()->json($result);
    }

    /**
     * Create a new tiktok account
     *
     * Creates a new tiktok account with the given details.
     * The new tiktok account object is returned upon successful creation.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            /**
             * The username of the tiktok account.
             * @example user123
             */
            'username' => ['required', 'string', 'max:255', 'unique:tiktok_accounts'],
            /**
             * The email associated with the tiktok account.
             * @example user@example.com
             */
            'email' => ['required', 'string', 'email', 'max:255', 'unique:tiktok_accounts'],
            /**
             * The password for the tiktok account.
             * @example password123
             */
            'password' => ['required', 'string', 'min:6'],
            /**
             * The phone number associated with the tiktok account.
             * @example 0987654321
             */
            'phone_number' => ['sometimes', 'string', 'max:255'],
            /**
             * The status of the tiktok account.
             * @example active
             */
            'status' => ['sometimes', 'string', 'in:active,inactive,suspended'],
            /**
             * Additional notes about the tiktok account.
             * @example Personal account for content creation
             */
            'notes' => ['sometimes', 'string', 'max:1000'],
            /**
             * Whether two-factor authentication is enabled.
             * @example true
             */
            'two_factor_enabled' => ['sometimes', 'boolean'],
            /**
             * Backup codes for two-factor authentication.
             * @example ["ABCD1234", "EFGH5678", "IJKL9012"]
             */
            'two_factor_backup_codes' => ['sometimes', 'array'],
            'two_factor_backup_codes.*' => ['string', 'max:255'],
        ]);

        $tiktokAccount = $this->tiktokAccountService->createTiktokAccount($validated);

        return response()->json($tiktokAccount, 201);
    }

    /**
     * Get a specific tiktok account
     *
     * Retrieves the details of a specific tiktok account by their ID.
     * Includes related data like pending tasks, running tasks, and statistics.
     * @param  TiktokAccount  $tiktokAccount The tiktok account model instance.
     */
    public function show(TiktokAccount $tiktokAccount)
    {
        $user = request()->user();
        if (!$user->hasRole('admin') && $tiktokAccount->user_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Load relationships and additional data
        $tiktokAccount->load([
            'pendingTasks' => function($query) {
                $query->select('id', 'tiktok_account_id', 'task_type', 'status', 'priority', 'scheduled_at', 'created_at')
                      ->orderBy('created_at', 'desc')
                      ->limit(10);
            },
            'runningTasks' => function($query) {
                $query->select('id', 'tiktok_account_id', 'task_type', 'status', 'priority', 'started_at', 'created_at')
                      ->orderBy('created_at', 'desc')
                      ->limit(10);
            },
            'interactionScenario:id,name'
        ]);

        // Add computed fields
        $accountData = $tiktokAccount->toArray();
        
        // Add task statistics
        $accountData['task_statistics'] = [
            'pending_tasks_count' => $tiktokAccount->pendingTasks->count(),
            'running_tasks_count' => $tiktokAccount->runningTasks->count(),
            'total_tasks_count' => $tiktokAccount->accountTasks()->count(),
            'completed_tasks_count' => $tiktokAccount->accountTasks()->where('status', 'completed')->count(),
            'failed_tasks_count' => $tiktokAccount->accountTasks()->where('status', 'failed')->count(),
        ];

        // Add formatted dates
        $accountData['join_date'] = $tiktokAccount->created_at->format('d/m/Y');
        $accountData['last_activity'] = $tiktokAccount->last_activity_at ? 
            $tiktokAccount->last_activity_at->diffForHumans() : 'Chưa có hoạt động';

        // Add display name (use nickname or username)
        $accountData['display_name'] = $tiktokAccount->nickname ?: $tiktokAccount->username;

        // Add view count estimation (since it's not in DB, we can estimate or set default)
        $accountData['estimated_views'] = $tiktokAccount->video_count * 1000; // Simple estimation

        return response()->json($accountData);
    }

    /**
     * Update a tiktok account
     *
     * Updates the details of a specific tiktok account.
     * @param  TiktokAccount  $tiktokAccount The tiktok account to update.
     */
    public function update(Request $request, TiktokAccount $tiktokAccount)
    {
        $user = $request->user();
        if (!$user->hasRole('admin') && $tiktokAccount->user_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            /**
             * The new username of the tiktok account.
             * @example newuser123
             */
            'username' => 'sometimes|string|max:255|unique:tiktok_accounts,username,'.$tiktokAccount->id,
            /**
             * The new email associated with the tiktok account.
             * @example newuser@example.com
             */
            'email' => 'sometimes|nullable|string|email|max:255|unique:tiktok_accounts,email,'.$tiktokAccount->id,
            /**
             * The new password for the tiktok account.
             * @example newpassword123
             */
            'password' => 'sometimes|nullable|string|min:6',
            /**
             * The new phone number associated with the tiktok account.
             * @example 0123456789
             */
            'phone_number' => 'sometimes|nullable|string|max:255',
            /**
             * The new status of the tiktok account.
             * @example inactive
             */
            'status' => 'sometimes|string|in:active,inactive,suspended',
            /**
             * Additional notes about the tiktok account.
             * @example Updated notes about the account
             */
            'notes' => 'sometimes|nullable|string|max:1000',
            /**
             * Whether two-factor authentication is enabled.
             * @example true
             */
            'two_factor_enabled' => 'sometimes|boolean',
            /**
             * Backup codes for two-factor authentication.
             * @example ["ABCD1234", "EFGH5678", "IJKL9012"]
             */
            'two_factor_backup_codes' => 'sometimes|nullable|array',
            'two_factor_backup_codes.*' => 'string|max:255',
            /**
             * Additional fields that exist in database
             */
            'nickname' => 'sometimes|nullable|string|max:255',
            'avatar_url' => 'sometimes|nullable|string|max:255',
            'follower_count' => 'sometimes|nullable|integer|min:0',
            'following_count' => 'sometimes|nullable|integer|min:0',
            'heart_count' => 'sometimes|nullable|integer|min:0',
            'video_count' => 'sometimes|nullable|integer|min:0',
            'bio_signature' => 'sometimes|nullable|string|max:1000',
            'device_id' => 'sometimes|nullable|integer|exists:devices,id',
            'scenario_id' => 'sometimes|nullable|integer|exists:interaction_scenarios,id',
            'proxy_id' => 'sometimes|nullable|integer',
            /**
             * Additional fields from frontend (will be ignored if not in database)
             */
            'display_name' => 'sometimes|nullable|string|max:255',
            'proxy_ip' => 'sometimes|nullable|string|max:255',
            'proxy_port' => 'sometimes|nullable|integer|min:1|max:65535',
            'proxy_username' => 'sometimes|nullable|string|max:255',
            'proxy_password' => 'sometimes|nullable|string|max:255',
            'device_info' => 'sometimes|nullable|string|max:1000',
            'tags' => 'sometimes|nullable|array',
        ]);

        $updatedTiktokAccount = $this->tiktokAccountService->updateTiktokAccount($tiktokAccount, $validated);

        return response()->json($updatedTiktokAccount);
    }

    /**
     * Delete a tiktok account
     *
     * Deletes a specific tiktok account.
     * @param  TiktokAccount  $tiktokAccount The tiktok account to delete.
     */
    public function destroy(TiktokAccount $tiktokAccount)
    {
        $user = request()->user();
        if (!$user->hasRole('admin') && $tiktokAccount->user_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $this->tiktokAccountService->deleteTiktokAccount($tiktokAccount);

        return response()->json(null, 204);
    }

    /**
     * Delete multiple tiktok accounts
     *
     * Deletes a list of tiktok accounts by their IDs.
     */
    public function bulkDelete(Request $request)
    {
        $validated = $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:tiktok_accounts,id',
        ]);

        $count = $this->tiktokAccountService->deleteMultiple($validated['ids']);

        return response()->json(['message' => "Successfully deleted {$count} tiktok accounts."]);
    }

    /**
     * Update status for multiple tiktok accounts
     *
     * Updates the status for a list of tiktok accounts.
     */
    public function bulkUpdateStatus(Request $request)
    {
        $validated = $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:tiktok_accounts,id',
            'status' => 'required|string|in:active,inactive,suspended',
        ]);

        $count = $this->tiktokAccountService->updateStatusMultiple($validated['ids'], $validated['status']);

        return response()->json(['message' => "Successfully updated {$count} tiktok accounts to status '{$validated['status']}'."]);
    }

    /**
     * Import multiple tiktok accounts
     *
     * Creates new tiktok accounts from a formatted string.
     * Supports two formats:
     * - Legacy: username|email|password|phone_number (phone_number optional)
     * - New: UID|PASS|2FA|MAIL
     * 
     * @bodyParam accountList string required The list of accounts in the specified format.
     * @bodyParam enableRunningStatus boolean Set accounts to active status after import.
     * @bodyParam autoAssign boolean Auto-assign device and scenario to accounts.
     * @bodyParam deviceId string The device ID to assign to imported accounts.
     * @bodyParam scenarioId string The scenario ID to assign to imported accounts.
     * @bodyParam format string The format of the account list: 'legacy' or 'new'. Default: 'legacy'
     * 
     * @response {
     *   "success": true,
     *   "message": "Successfully imported 5 accounts",
     *   "data": {
     *     "imported_count": 5,
     *     "failed_count": 0,
     *     "total_processed": 5,
     *     "imported_accounts": [
     *       {
     *         "id": 123,
     *         "username": "user123",
     *         "email": "user@example.com",
     *         "status": "active",
     *         "device_id": "device_456",
     *         "scenario_id": "scenario_789"
     *       }
     *     ],
     *     "failed_accounts": []
     *   }
     * }
     */
    public function import(Request $request)
    {
        $validated = $request->validate([
            /**
             * The list of accounts to import.
             * Legacy format: username|email|password|phone_number
             * New format: UID|PASS|2FA|MAIL
             * @example "user1|pass123|ABCD1234|user1@example.com\nuser2|pass456|EFGH5678|user2@example.com"
             */
            'accountList' => 'required|string',
            /**
             * Set imported accounts to active status.
             * @example true
             */
            'enableRunningStatus' => 'sometimes|boolean',
            /**
             * Auto-assign device and scenario to imported accounts.
             * @example true
             */
            'autoAssign' => 'sometimes|boolean',
            /**
             * Device ID to assign to imported accounts.
             * @example "device_123"
             */
            'deviceId' => 'sometimes|string|exists:devices,id',
            /**
             * Scenario ID to assign to imported accounts.
             * @example "scenario_456"
             */
            'scenarioId' => 'sometimes|string|exists:interaction_scenarios,id',
            /**
             * Format of the account list.
             * @example "new"
             */
            'format' => 'sometimes|string|in:legacy,new',
        ]);

        // Default format is legacy for backward compatibility
        $validated['format'] = $validated['format'] ?? 'legacy';

        // Ensure user context is passed to service
        $validated['user_id'] = $request->user()->id ?? null;

        $result = $this->tiktokAccountService->importAccounts($validated);

        return response()->json($result);
    }

    /**
     * Get TikTok account statistics
     *
     * Retrieves statistical data about TikTok accounts including totals, 
     * active/inactive counts, running tasks, and percentage changes.
     * 
     * @response {
     *   "data": {
     *     "totalAccounts": 156,
     *     "activeAccounts": 142,
     *     "inactiveAccounts": 14,
     *     "runningTasks": 23,
     *     "totalAccountsChange": "+12%",
     *     "totalAccountsChangeType": "increase",
     *     "activeAccountsChange": "+5%",
     *     "activeAccountsChangeType": "increase",
     *     "inactiveAccountsChange": "-8%",
     *     "inactiveAccountsChangeType": "decrease",
     *     "runningTasksChange": "+15%",
     *     "runningTasksChangeType": "increase"
     *   }
     * }
     */
    public function stats(Request $request)
    {
        $user = $request->user();
        
        $stats = $this->tiktokAccountService->getStatistics($user);
        
        return response()->json([
            'data' => $stats
        ]);
    }

    /**
     * Get TikTok account task analysis
     *
     * Retrieves detailed task analysis for TikTok accounts including 
     * pending tasks, running tasks, and task distribution statistics.
     * 
     * @response {
     *   "data": {
     *     "task_overview": {
     *       "total_accounts": 156,
     *       "accounts_with_pending_tasks": 23,
     *       "accounts_with_running_tasks": 12,
     *       "accounts_with_no_tasks": 45,
     *       "idle_accounts": 76
     *     },
     *     "task_statistics": {
     *       "total_pending_tasks": 89,
     *       "total_running_tasks": 34,
     *       "total_completed_tasks": 1245,
     *       "total_failed_tasks": 67,
     *       "average_success_rate": 94.9
     *     },
     *     "task_distribution": [
     *       {"task_type": "follow_user", "count": 45, "percentage": 35.2},
     *       {"task_type": "like_video", "count": 32, "percentage": 25.0}
     *     ]
     *   }
     * }
     */
    public function taskAnalysis(Request $request)
    {
        $user = $request->user();
        
        $analysis = $this->tiktokAccountService->getTaskAnalysis($user);
        
        return response()->json([
            'data' => $analysis
        ]);
    }

    /**
     * Run linked scenario for a TikTok account: create pending account tasks from its scenario scripts
     */
    public function runScenario(Request $request, TiktokAccount $tiktokAccount)
    {
        \Log::info('runScenario called for account:', ['id' => $tiktokAccount->id, 'username' => $tiktokAccount->username]);
        
        $user = $request->user();
        if (!$user->hasRole('admin') && $tiktokAccount->user_id !== $user->id) {
            \Log::warning('Unauthorized access attempt:', ['user_id' => $user->id, 'account_user_id' => $tiktokAccount->user_id]);
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Validate that account has scenario and device assigned
        if (!$tiktokAccount->scenario_id) {
            \Log::warning('Account has no linked scenario:', ['account_id' => $tiktokAccount->id]);
            return response()->json(['message' => 'Account has no linked scenario.'], 422);
        }

        // Optional: allow override device via body
        $validated = $request->validate([
            'device_id' => 'sometimes|exists:devices,id',
        ]);
        $deviceId = $validated['device_id'] ?? $tiktokAccount->device_id;
        
        \Log::info('Running scenario for account:', [
            'account_id' => $tiktokAccount->id,
            'scenario_id' => $tiktokAccount->scenario_id,
            'device_id' => $deviceId,
            'user_id' => $user->id
        ]);

        $result = app(\App\Services\AccountTaskService::class)
            ->createTasksFromScenario($tiktokAccount, $deviceId, $user->id);

        \Log::info('runScenario result:', $result);
        return response()->json($result);
    }

    /**
     * Get TikTok account activity history
     *
     * Retrieves the activity history for a specific TikTok account including
     * completed, failed, running, and pending tasks with pagination support.
     * 
     * @param  TiktokAccount  $tiktokAccount The tiktok account model instance.
     * @response {
     *   "data": {
     *     "activities": [
     *       {
     *         "id": "task_123",
     *         "task_type": "follow_user",
     *         "status": "completed",
     *         "priority": "high",
     *         "completed_at": "2024-01-15T10:30:00Z",
     *         "started_at": "2024-01-15T10:25:00Z",
     *         "scheduled_at": "2024-01-15T10:20:00Z",
     *         "created_at": "2024-01-15T10:15:00Z"
     *       }
     *     ],
     *     "pagination": {
     *       "current_page": 1,
     *       "per_page": 20,
     *       "total": 156,
     *       "last_page": 8
     *     }
     *   }
     * }
     */
    #[QueryParameter('page', description: 'The page number for pagination.', example: 1)]
    #[QueryParameter('per_page', description: 'The number of items per page (max 50).', example: 20)]
    #[QueryParameter('status', description: 'Filter by task status: completed, failed, running, pending.', example: 'completed')]
    #[QueryParameter('task_type', description: 'Filter by task type.', example: 'follow_user')]
    #[QueryParameter('priority', description: 'Filter by priority: low, medium, high.', example: 'high')]
    public function activityHistory(Request $request, TiktokAccount $tiktokAccount)
    {
        $user = $request->user();
        if (!$user->hasRole('admin') && $tiktokAccount->user_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'page' => 'sometimes|integer|min:1',
            'per_page' => 'sometimes|integer|min:1|max:50',
            'status' => 'sometimes|string|in:completed,failed,running,pending',
            'task_type' => 'sometimes|string',
            'priority' => 'sometimes|string|in:low,medium,high',
        ]);

        $perPage = $validated['per_page'] ?? 20;
        $page = $validated['page'] ?? 1;

        // Build query for all tasks related to this account
        $query = $tiktokAccount->accountTasks()
            ->select([
                'id', 
                'task_type', 
                'status', 
                'priority', 
                'completed_at', 
                'started_at', 
                'scheduled_at', 
                'created_at',
                'error_message'
            ]);

        // Apply filters
        if (isset($validated['status'])) {
            $query->where('status', $validated['status']);
        }

        if (isset($validated['task_type'])) {
            $query->where('task_type', $validated['task_type']);
        }

        if (isset($validated['priority'])) {
            $query->where('priority', $validated['priority']);
        }

        // Order by most recent activity first
        $query->orderByRaw("
            CASE 
                WHEN completed_at IS NOT NULL THEN completed_at
                WHEN started_at IS NOT NULL THEN started_at
                WHEN scheduled_at IS NOT NULL THEN scheduled_at
                ELSE created_at
            END DESC
        ");

        // Paginate results
        $activities = $query->paginate($perPage, ['*'], 'page', $page);

        return response()->json([
            'data' => [
                'activities' => $activities->items(),
                'pagination' => [
                    'current_page' => $activities->currentPage(),
                    'per_page' => $activities->perPage(),
                    'total' => $activities->total(),
                    'last_page' => $activities->lastPage(),
                    'from' => $activities->firstItem(),
                    'to' => $activities->lastItem(),
                ]
            ]
        ]);
    }

    /**
     * Get recent activities across all TikTok accounts
     *
     * Returns recent activities/tasks for all TikTok accounts that the user has access to.
     * Admin can see all activities, regular users can only see their own accounts' activities.
     */
    public function recentActivities(Request $request)
    {
        $user = $request->user();
        
        // Build base query for account tasks
        $query = \App\Models\AccountTask::query()
            ->with(['tiktokAccount:id,username'])
            ->select([
                'id',
                'tiktok_account_id',
                'task_type',
                'status',
                'priority',
                'completed_at',
                'started_at',
                'scheduled_at',
                'created_at',
                'error_message'
            ]);

        // If not admin, only show activities for user's accounts
        if (!$user->hasRole('admin')) {
            $query->whereHas('tiktokAccount', function ($q) use ($user) {
                $q->where('user_id', $user->id);
            });
        }

        // Order by most recent activity first
        $activities = $query->orderByRaw("
            CASE 
                WHEN completed_at IS NOT NULL THEN completed_at
                WHEN started_at IS NOT NULL THEN started_at
                WHEN scheduled_at IS NOT NULL THEN scheduled_at
                ELSE created_at
            END DESC
        ")
        ->limit(20)
        ->get()
        ->filter(function ($task) {
            // Only include tasks that have a valid TiktokAccount
            return $task->tiktokAccount !== null;
        })
        ->map(function ($task) {
            // Determine the action text based on task type and status
            $actionText = $this->getActionText($task->task_type, $task->status);
            
            // Determine the time to display
            $time = $task->completed_at ?? $task->started_at ?? $task->scheduled_at ?? $task->created_at;
            
            return [
                'id' => $task->id,
                'username' => '@' . $task->tiktokAccount->username,
                'action' => $actionText,
                'status' => $task->status,
                'time' => $time->diffForHumans(),
                'scenario_name' => $this->getScenarioName($task->task_type),
                'priority' => $task->priority,
                'error_message' => $task->error_message
            ];
        })
        ->values(); // Re-index the collection

        return response()->json($activities);
    }

    /**
     * Get action text based on task type and status
     */
    private function getActionText($taskType, $status)
    {
        $actionMap = [
            'follow_user' => 'Follow người dùng',
            'like_post' => 'Like bài viết',
            'comment_post' => 'Comment bài viết',
            'create_post' => 'Tạo bài viết',
            'update_avatar' => 'Cập nhật avatar',
            'change_bio' => 'Thay đổi bio',
            'change_name' => 'Thay đổi tên',
            'auto_login' => 'Đăng nhập tự động',
            'notification' => 'Thông báo',
            'video_interaction' => 'Tương tác video',
            'live_interaction' => 'Tương tác livestream',
            'random_video_interaction' => 'Tương tác video ngẫu nhiên',
            'specific_video_interaction' => 'Tương tác video cụ thể',
            'keyword_video_interaction' => 'Tương tác video theo từ khóa',
            'user_video_interaction' => 'Tương tác video người dùng',
            'random_live_interaction' => 'Tương tác livestream ngẫu nhiên',
            'specific_live_interaction' => 'Tương tác livestream cụ thể',
            'follow_user_list' => 'Follow danh sách người dùng',
            'follow_user_keyword' => 'Follow theo từ khóa',
            'follow_back' => 'Follow back',
        ];

        $baseAction = $actionMap[$taskType] ?? ucfirst(str_replace('_', ' ', $taskType));

        switch ($status) {
            case 'completed':
                return "Hoàn thành {$baseAction}";
            case 'failed':
                return "Lỗi khi {$baseAction}";
            case 'running':
                return "Đang {$baseAction}";
            case 'pending':
                return "Chuẩn bị {$baseAction}";
            default:
                return $baseAction;
        }
    }

    /**
     * Get scenario name based on task type
     */
    private function getScenarioName($taskType)
    {
        $scenarioMap = [
            'follow_user' => 'Follow Campaign',
            'like_post' => 'Like Posts',
            'comment_post' => 'Comment Campaign',
            'create_post' => 'Content Creation',
            'update_avatar' => 'Profile Update',
            'change_bio' => 'Profile Update',
            'change_name' => 'Profile Update',
            'auto_login' => 'Auto Login',
            'notification' => 'Notification',
            'video_interaction' => 'Video Interaction',
            'live_interaction' => 'Live Interaction',
            'random_video_interaction' => 'Random Video Interaction',
            'specific_video_interaction' => 'Specific Video Interaction',
            'keyword_video_interaction' => 'Keyword Video Interaction',
            'user_video_interaction' => 'User Video Interaction',
            'random_live_interaction' => 'Random Live Interaction',
            'specific_live_interaction' => 'Specific Live Interaction',
            'follow_user_list' => 'Follow Campaign',
            'follow_user_keyword' => 'Follow Campaign',
            'follow_back' => 'Follow Campaign',
        ];

        return $scenarioMap[$taskType] ?? 'General Task';
    }

    /**
     * Enable two-factor authentication for a TikTok account
     *
     * Enables 2FA and generates backup codes for the account.
     * @param  TiktokAccount  $tiktokAccount The tiktok account to enable 2FA for.
     */
    public function enable2FA(Request $request, TiktokAccount $tiktokAccount)
    {
        $user = $request->user();
        if (!$user->hasRole('admin') && $tiktokAccount->user_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            /**
             * Backup codes for two-factor authentication.
             * @example ["ABCD1234", "EFGH5678", "IJKL9012", "MNOP3456", "QRST7890"]
             */
            'backup_codes' => 'sometimes|array|min:1|max:10',
            'backup_codes.*' => 'string|max:255',
        ]);

        // Generate backup codes if not provided
        $backupCodes = $validated['backup_codes'] ?? $this->generateBackupCodes();

        $updatedAccount = $this->tiktokAccountService->updateTiktokAccount($tiktokAccount, [
            'two_factor_enabled' => true,
            'two_factor_backup_codes' => $backupCodes,
        ]);

        return response()->json([
            'message' => 'Two-factor authentication enabled successfully',
            'data' => [
                'two_factor_enabled' => $updatedAccount->two_factor_enabled,
                'backup_codes' => $updatedAccount->two_factor_backup_codes,
            ]
        ]);
    }

    /**
     * Disable two-factor authentication for a TikTok account
     *
     * Disables 2FA and removes backup codes for the account.
     * @param  TiktokAccount  $tiktokAccount The tiktok account to disable 2FA for.
     */
    public function disable2FA(Request $request, TiktokAccount $tiktokAccount)
    {
        $user = $request->user();
        if (!$user->hasRole('admin') && $tiktokAccount->user_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $updatedAccount = $this->tiktokAccountService->updateTiktokAccount($tiktokAccount, [
            'two_factor_enabled' => false,
            'two_factor_backup_codes' => null,
        ]);

        return response()->json([
            'message' => 'Two-factor authentication disabled successfully',
            'data' => [
                'two_factor_enabled' => $updatedAccount->two_factor_enabled,
                'backup_codes' => $updatedAccount->two_factor_backup_codes,
            ]
        ]);
    }

    /**
     * Regenerate backup codes for a TikTok account
     *
     * Generates new backup codes for an account with 2FA enabled.
     * @param  TiktokAccount  $tiktokAccount The tiktok account to regenerate codes for.
     */
    public function regenerateBackupCodes(Request $request, TiktokAccount $tiktokAccount)
    {
        $user = $request->user();
        if (!$user->hasRole('admin') && $tiktokAccount->user_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if (!$tiktokAccount->two_factor_enabled) {
            return response()->json(['message' => 'Two-factor authentication is not enabled for this account'], 422);
        }

        $newBackupCodes = $this->generateBackupCodes();

        $updatedAccount = $this->tiktokAccountService->updateTiktokAccount($tiktokAccount, [
            'two_factor_backup_codes' => $newBackupCodes,
        ]);

        return response()->json([
            'message' => 'Backup codes regenerated successfully',
            'data' => [
                'backup_codes' => $updatedAccount->two_factor_backup_codes,
            ]
        ]);
    }

    /**
     * Delete all pending tasks for specified TikTok accounts
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function deletePendingTasks(Request $request)
    {
        $request->validate([
            'account_ids' => 'required|array',
            'account_ids.*' => 'integer|exists:tiktok_accounts,id'
        ]);

        $user = $request->user();
        $accountIds = $request->input('account_ids');

        try {
            // Get accounts that belong to the user with their devices
            $accounts = TiktokAccount::where('user_id', $user->id)
                ->whereIn('id', $accountIds)
                ->with('device')
                ->get();

            if ($accounts->isEmpty()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Không tìm thấy tài khoản nào thuộc về bạn'
                ], 404);
            }

            $deletedCount = 0;
            $devicesNotified = [];

            foreach ($accounts as $account) {
                // Delete all pending tasks for this account
                $deleted = $account->accountTasks()
                    ->where('status', 'pending')
                    ->delete();
                
                $deletedCount += $deleted;
                
                // Fire StopTaskOnDevice event if account has a device and tasks were deleted
                if ($deleted > 0 && $account->device && !in_array($account->device->id, $devicesNotified)) {
                    event(new StopTaskOnDevice($account->device));
                    $devicesNotified[] = $account->device->id;
                    \Log::info("Fired StopTaskOnDevice event for device: {$account->device->device_id}");
                }
            }

            return response()->json([
                'success' => true,
                'message' => "Đã xóa {$deletedCount} pending tasks thành công",
                'data' => [
                    'deleted_count' => $deletedCount,
                    'processed_accounts' => $accounts->count(),
                    'devices_notified' => count($devicesNotified)
                ]
            ]);

        } catch (\Exception $e) {
            \Log::error('Error deleting pending tasks: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Có lỗi xảy ra khi xóa pending tasks'
            ], 500);
        }
    }

    /**
     * Generate backup codes for 2FA
     *
     * @return array
     */
    private function generateBackupCodes()
    {
        $codes = [];
        for ($i = 0; $i < 8; $i++) {
            $codes[] = strtoupper(substr(str_shuffle('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'), 0, 8));
        }
        return $codes;
    }
}

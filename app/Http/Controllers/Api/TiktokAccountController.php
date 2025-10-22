<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TiktokAccount;
use App\Services\TiktokAccountService;
use Dedoc\Scramble\Attributes\Group;
use Dedoc\Scramble\Attributes\QueryParameter;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

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
    #[QueryParameter('filter[connection_type]', description: 'Filter accounts by connection type: wifi or 4g.', example: 'wifi')]
    #[QueryParameter('sort', description: 'Sort tiktok accounts by `username`, `email`, `created_at`, `pending_tasks_count`, `connection_type`. Prefix with `-` for descending.', example: '-pending_tasks_count')]
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
            /**
             * Additional fields
             */
            'nickname' => ['sometimes', 'string', 'max:255'],
            'display_name' => ['sometimes', 'string', 'max:255'],
            'device_id' => ['sometimes', 'nullable', 'integer', 'exists:devices,id'],
            'scenario_id' => ['sometimes', 'nullable', 'integer', 'exists:interaction_scenarios,id'],
            'proxy_id' => ['sometimes', 'nullable', 'integer', 'exists:proxies,id'],
            'device_info' => ['sometimes', 'string', 'max:1000'],
            /**
             * The connection type for the account (WiFi or 4G).
             * @example wifi
             */
            'connection_type' => ['sometimes', 'string', 'in:wifi,4g'],
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

        $accountData = $this->tiktokAccountService->getAccountDetails($tiktokAccount, $user);
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
            'proxy_id' => 'sometimes|nullable|integer|exists:proxies,id',
            /**
             * The connection type for the account (WiFi or 4G).
             * @example wifi
             */
            'connection_type' => 'sometimes|string|in:wifi,4g',
            /**
             * Additional fields from frontend (will be ignored if not in database)
             */
            'display_name' => 'sometimes|nullable|string|max:255',
            'device_info' => 'sometimes|nullable|string|max:1000',
            'tags' => 'sometimes|nullable|array',
        ]);

        $updatedTiktokAccount = $this->tiktokAccountService->updateTiktokAccount($tiktokAccount, $validated);

        return response()->json($updatedTiktokAccount);
    }

    /**
     * Update proxy for a TikTok account
     *
     * Updates the proxy for a specific TikTok account.
     * @param Request $request
     * @param TiktokAccount $tiktokAccount The tiktok account to update proxy for.
     */
    public function updateProxy(Request $request, TiktokAccount $tiktokAccount)
    {
        $user = $request->user();
        if (!$user->hasRole('admin') && $tiktokAccount->user_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            /**
             * The proxy ID to assign to the account.
             * @example 123
             */
            'proxy_id' => 'sometimes|nullable|integer|exists:proxies,id',
        ]);

        try {
            $updatedAccount = $this->tiktokAccountService->updateProxy($tiktokAccount, $validated['proxy_id'] ?? null);

            return response()->json([
                'success' => true,
                'message' => 'Proxy updated successfully',
                'data' => [
                    'id' => $updatedAccount->id,
                    'username' => $updatedAccount->username,
                    'proxy_id' => $updatedAccount->proxy_id,
                    'updated_at' => $updatedAccount->updated_at,
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Error updating proxy for TikTok account: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to update proxy: ' . $e->getMessage()
            ], 500);
        }
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
     * @bodyParam proxyId string The proxy ID to assign to imported accounts.
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
             * Proxy ID to assign to imported accounts.
             * @example "proxy_789"
             */
            'proxyId' => 'sometimes|string|exists:proxies,id',
            /**
             * Connection type to assign to imported accounts.
             * @example "wifi"
             */
            'connectionType' => 'sometimes|string|in:wifi,4g',
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
        Log::info('runScenario called for account:', ['id' => $tiktokAccount->id, 'username' => $tiktokAccount->username]);

        $user = $request->user();
        if (!$user->hasRole('admin') && $tiktokAccount->user_id !== $user->id) {
            Log::warning('Unauthorized access attempt:', ['user_id' => $user->id, 'account_user_id' => $tiktokAccount->user_id]);
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Validate that account has scenario and device assigned
        if (!$tiktokAccount->scenario_id) {
            Log::warning('Account has no linked scenario:', ['account_id' => $tiktokAccount->id]);
            return response()->json(['message' => 'Account has no linked scenario.'], 422);
        }

        // Optional: allow override device via body
        $validated = $request->validate([
            'device_id' => 'sometimes|exists:devices,id',
        ]);
        // Fallback BE: nếu FE không truyền device_id, dùng device gán cho account
        $deviceId = $validated['device_id'] ?? $tiktokAccount->device_id;

        // Chặn tạo thêm nếu thiết bị đang có task chạy (đã xử lý ở service, có thể bỏ nếu muốn chỉ giữ logic tại service)
        if ($deviceId) {
            $hasRunningTaskOnDevice = \App\Models\AccountTask::where('device_id', $deviceId)
                ->where('status', 'running')
                ->exists();
            if ($hasRunningTaskOnDevice) {
                return response()->json([
                    'success' => false,
                    'message' => 'Thiết bị đang có task chạy, không tạo thêm task mới.'
                ], 409);
            }
        }

        Log::info('Running scenario for account:', [
            'account_id' => $tiktokAccount->id,
            'scenario_id' => $tiktokAccount->scenario_id,
            'device_id' => $deviceId,
            'user_id' => $user->id
        ]);

        $result = $this->tiktokAccountService->runScenarioForAccount($tiktokAccount, $deviceId, $user->id);

        Log::info('runScenario result:', $result);
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

        $data = $this->tiktokAccountService->getActivityHistory($tiktokAccount, $validated);
        return response()->json(['data' => $data]);
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

        // Sử dụng service để lấy hoạt động gần đây cho user (admin sẽ thấy tất cả)
        $activities = $this->tiktokAccountService->getRecentActivities($user);
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

        $updatedAccount = $this->tiktokAccountService->enableTwoFactor($tiktokAccount, $validated['backup_codes'] ?? null);

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

        $updatedAccount = $this->tiktokAccountService->disableTwoFactor($tiktokAccount);

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

        $updatedAccount = $this->tiktokAccountService->regenerateBackupCodes($tiktokAccount);

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
            $result = $this->tiktokAccountService->deletePendingTasksForUser($user, $accountIds);
            if (!$result['success']) {
                return response()->json($result, 404);
            }
            return response()->json($result);
        } catch (\Exception $e) {
            Log::error('Error deleting pending tasks: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Có lỗi xảy ra khi xóa pending tasks'
            ], 500);
        }
    }

    /**
     * Upload file for TikTok account (avatar, post content)
     *
     * Uploads a file (image/video) for use with TikTok account operations.
     * Files are stored in the public storage disk.
     *
     * @param Request $request
     * @param TiktokAccount $tiktokAccount
     * @return \Illuminate\Http\JsonResponse
     */
    public function uploadFile(Request $request, TiktokAccount $tiktokAccount)
    {
        $user = $request->user();
        if (!$user->hasRole('admin') && $tiktokAccount->user_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            /**
             * The file to upload (image or video).
             * @example file
             */
            'file' => 'required|file|mimes:jpeg,png,jpg,gif,mp4,mov,avi,wmv,flv,webm|max:102400', // 100MB max
            /**
             * The type of file being uploaded.
             * @example avatar
             */
            'type' => 'required|string|in:avatar,post_content,story',
            /**
             * Optional description for the file.
             * @example Profile picture for TikTok account
             */
            'description' => 'sometimes|string|max:255',
        ]);

        try {
            $file = $validated['file'];
            $type = $validated['type'];
            $description = $validated['description'] ?? '';

            $data = $this->tiktokAccountService->uploadFileForAccount($tiktokAccount, $file, $type, $description, $user->id);

            return response()->json([
                'success' => true,
                'message' => 'File uploaded successfully',
                'data' => [
                    'file_url' => $data['file_url'],
                    'filename' => $data['filename'],
                    'original_name' => $data['original_name'],
                    'size' => $data['size'],
                    'mime_type' => $data['mime_type'],
                    'type' => $type,
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Error uploading file for TikTok account: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to upload file: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Create a post for TikTok account
     *
     * Creates a new post with uploaded content for the specified TikTok account.
     * This endpoint handles the post creation process including file uploads.
     *
     * @param Request $request
     * @param TiktokAccount $tiktokAccount
     * @return \Illuminate\Http\JsonResponse
     */
    public function createPost(Request $request, TiktokAccount $tiktokAccount)
    {
        $user = $request->user();
        if (!$user->hasRole('admin') && $tiktokAccount->user_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            /**
             * The title of the post.
             * @example My amazing TikTok video
             */
            'title' => 'sometimes|string|max:255',
            /**
             * The content/description of the post.
             * @example Check out this amazing content! #tiktok #viral
             */
            'content' => 'sometimes|string|max:2000',
            /**
             * Array of uploaded file IDs or file data.
             * @example [1, 2, 3]
             */
            'file_ids' => 'sometimes|array',
            'file_ids.*' => 'integer|exists:files,id',
            /**
             * Direct file uploads (alternative to file_ids).
             * @example file
             */
            'files' => 'sometimes|array',
            'files.*' => 'file|mimes:jpeg,png,jpg,gif,mp4,mov,avi,wmv,flv,webm|max:102400',
            /**
             * Post settings and configuration.
             * @example {"privacy": "public", "allow_comments": true}
             */
            'settings' => 'sometimes|array',
            /**
             * Scheduled time for posting (optional).
             * @example 2024-01-15T10:30:00Z
             */
            'scheduled_at' => 'sometimes|date|after:now',
            /**
             * Whether to auto-cut the video.
             * @example true
             */
            'auto_cut' => 'sometimes|boolean',
            /**
             * Filter type for the post.
             * @example random
             */
            'filter_type' => 'sometimes|string|in:random,custom,none',
            /**
             * Custom filters list.
             * @example ["filter1", "filter2"]
             */
            'custom_filters' => 'sometimes|array',
            'custom_filters.*' => 'string|max:100',
            /**
             * Whether to add trending music.
             * @example true
             */
            'add_trending_music' => 'sometimes|boolean',
            /**
             * Whether to enable TikTok Shop.
             * @example false
             */
            'enable_tiktok_shop' => 'sometimes|boolean',
        ]);

        try {
            $result = $this->tiktokAccountService->createPostForAccount($tiktokAccount, $validated, $user->id);
            if (!$result['success']) {
                return response()->json($result, 409);
            }
            return response()->json($result);
        } catch (\Exception $e) {
            Log::error('Error creating post for TikTok account: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to create post: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update avatar for TikTok account
     *
     * Updates the avatar/profile picture for the specified TikTok account.
     *
     * @param Request $request
     * @param TiktokAccount $tiktokAccount
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateAvatar(Request $request, TiktokAccount $tiktokAccount)
    {
        $user = $request->user();
        if (!$user->hasRole('admin') && $tiktokAccount->user_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            /**
             * The avatar image file to upload.
             * @example file
             */
            'avatar' => 'required|image|mimes:jpeg,png,jpg,gif|max:10240', // 10MB max
            /**
             * Optional description for the avatar.
             * @example New profile picture
             */
            'description' => 'sometimes|string|max:255',
        ]);

        try {
            $file = $validated['avatar'];
            $description = $validated['description'] ?? '';

            $result = $this->tiktokAccountService->updateAvatarForAccount($tiktokAccount, $file, $description, $user->id);
            if (!$result['success']) {
                return response()->json($result, 409);
            }
            return response()->json($result);
        } catch (\Exception $e) {
            Log::error('Error updating avatar for TikTok account: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to update avatar: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update connection type for a TikTok account
     *
     * Updates the connection type (WiFi/4G) for the specified TikTok account.
     * This is useful for managing network connectivity preferences.
     *
     * @param Request $request
     * @param TiktokAccount $tiktokAccount
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateConnectionType(Request $request, TiktokAccount $tiktokAccount)
    {
        $user = $request->user();
        if (!$user->hasRole('admin') && $tiktokAccount->user_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            /**
             * The connection type to set for the account.
             * @example wifi
             */
            'connection_type' => 'required|string|in:wifi,4g',
        ]);

        try {
            $updatedAccount = $this->tiktokAccountService->updateConnectionType($tiktokAccount, $validated['connection_type']);

            return response()->json([
                'success' => true,
                'message' => "Connection type updated successfully to {$validated['connection_type']}",
                'data' => [
                    'id' => $updatedAccount->id,
                    'username' => $updatedAccount->username,
                    'connection_type' => $updatedAccount->connection_type,
                    'updated_at' => $updatedAccount->updated_at,
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Error updating connection type for TikTok account: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to update connection type: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Bulk update connection type for multiple TikTok accounts
     *
     * Updates the connection type (WiFi/4G) for multiple TikTok accounts at once.
     * This is useful for batch operations on multiple accounts.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function bulkUpdateConnectionType(Request $request)
    {
        $validated = $request->validate([
            /**
             * Array of TikTok account IDs to update.
             * @example [1, 2, 3]
             */
            'account_ids' => 'required|array|min:1',
            'account_ids.*' => 'integer|exists:tiktok_accounts,id',
            /**
             * The connection type to set for all accounts.
             * @example 4g
             */
            'connection_type' => 'required|string|in:wifi,4g',
        ]);

        $user = $request->user();
        $accountIds = $validated['account_ids'];
        $connectionType = $validated['connection_type'];

        try {
            $result = $this->tiktokAccountService->bulkUpdateConnectionType($user, $accountIds, $connectionType);

            return response()->json([
                'success' => true,
                'message' => "Successfully updated connection type to {$connectionType} for {$result['updated_count']} accounts",
                'data' => [
                    'updated_count' => $result['updated_count'],
                    'failed_count' => $result['failed_count'],
                    'total_processed' => count($accountIds),
                    'connection_type' => $connectionType,
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Error bulk updating connection type: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to bulk update connection type: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get connection type statistics for TikTok accounts
     *
     * Retrieves statistics about connection types across all TikTok accounts.
     * Shows count of accounts using WiFi vs 4G.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getConnectionTypeStats(Request $request)
    {
        $user = $request->user();

        try {
            $stats = $this->tiktokAccountService->getConnectionTypeStatistics($user);

            return response()->json([
                'success' => true,
                'data' => $stats
            ]);

        } catch (\Exception $e) {
            Log::error('Error getting connection type statistics: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to get connection type statistics: ' . $e->getMessage()
            ], 500);
        }
    }
}

<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\FacebookAccount;
use App\Services\FacebookAccountService;
use Dedoc\Scramble\Attributes\Group;
use Dedoc\Scramble\Attributes\QueryParameter;
use Illuminate\Http\Request;
use App\Models\AccountTask;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

#[Group('Facebook Account Management')]
class FacebookAccountController extends Controller
{
    public function __construct(private FacebookAccountService $service) {}

    #[QueryParameter('search', description: 'Tìm kiếm theo username/email')]
    #[QueryParameter('sort', description: 'Sắp xếp theo cột')]
    #[QueryParameter('page', description: 'Trang')]
    #[QueryParameter('per_page', description: 'Số bản ghi/trang')]
    public function index(Request $request)
    {
        $user = $request->user();
        if (!$user->hasRole('super-admin')) {
            $request->merge(['user_id' => $user->id]);
        }
        $result = $this->service->getAll($request);
        return response()->json($result);
    }

    public function show(Request $request, FacebookAccount $facebookAccount)
    {
        $user = $request->user();
        // Only super-admin can update accounts with null user_id, or users can update their own accounts
        if (!$user->hasRole('super-admin') && ($facebookAccount->user_id !== $user->id)) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        $facebookAccount->load(['device','interactionScenario','proxy:id,name,host,port,type,status,country,city']);
        return response()->json(['data' => $facebookAccount]);
    }

    public function stats(Request $request)
    {
        $stats = $this->service->getStatistics($request->user());
        return response()->json(['data' => $stats]);
    }

    public function import(Request $request)
    {
        $validated = $request->validate([
            'accountList' => 'required|string',
            'enableRunningStatus' => 'sometimes|boolean',
            'autoAssign' => 'sometimes|boolean',
            'deviceId' => 'sometimes|string|exists:devices,id',
            'scenarioId' => 'sometimes|string|exists:interaction_scenarios,id',
            'proxyId' => 'sometimes|string|exists:proxies,id',
            'connectionType' => 'sometimes|string|in:wifi,4g',
            'format' => 'sometimes|string|in:legacy,new',
        ]);
        $validated['user_id'] = $request->user()->id ?? null;
        $result = $this->service->import($validated);
        return response()->json($result);
    }

    public function update(Request $request, FacebookAccount $facebookAccount)
    {
        $user = $request->user();
        // Only super-admin can update accounts with null user_id, or users can update their own accounts
        if (!$user->hasRole('super-admin') && ($facebookAccount->user_id !== $user->id)) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        $validated = $request->validate([
            'username' => 'sometimes|string|max:255|unique:facebook_accounts,username,'.$facebookAccount->id,
            'email' => 'sometimes|nullable|string|email|max:255|unique:facebook_accounts,email,'.$facebookAccount->id,
            'password' => 'sometimes|nullable|string|min:6',
            'phone_number' => 'sometimes|nullable|string|max:255',
            'status' => 'sometimes|string|in:active,inactive,suspended,running,error',
            'notes' => 'sometimes|nullable|string|max:1000',
            'two_factor_enabled' => 'sometimes|boolean',
            'two_factor_backup_codes' => 'sometimes|nullable|array',
            'two_factor_backup_codes.*' => 'string|max:255',
            'device_id' => 'sometimes|nullable|integer|exists:devices,id',
            'scenario_id' => 'sometimes|nullable|integer|exists:interaction_scenarios,id',
            'proxy_id' => 'sometimes|nullable|integer|exists:proxies,id',
            'connection_type' => 'sometimes|string|in:wifi,4g',
            'device_info' => 'sometimes|nullable|string|max:1000',
        ]);
        $updated = $this->service->update($facebookAccount, $validated);
        return response()->json($updated);
    }

    public function updateConnectionType(Request $request, FacebookAccount $facebookAccount)
    {
        $user = $request->user();
        // Only super-admin can update accounts with null user_id, or users can update their own accounts
        if (!$user->hasRole('super-admin') && ($facebookAccount->user_id !== $user->id)) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        $validated = $request->validate([
            'connection_type' => 'required|string|in:wifi,4g',
        ]);
        $updated = $this->service->updateConnectionType($facebookAccount, $validated['connection_type']);
        return response()->json([
            'success' => true,
            'data' => [
                'id' => $updated->id,
                'username' => $updated->username,
                'connection_type' => $updated->connection_type,
            ]
        ]);
    }

    public function activityHistory(Request $request, FacebookAccount $facebookAccount)
    {
        $user = $request->user();
        // Only super-admin can update accounts with null user_id, or users can update their own accounts
        if (!$user->hasRole('super-admin') && ($facebookAccount->user_id !== $user->id)) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'page' => 'sometimes|integer|min:1',
            'per_page' => 'sometimes|integer|min:1|max:50',
            'status' => 'sometimes|string|in:completed,failed,running,pending',
            'task_type' => 'sometimes|string',
            'priority' => 'sometimes|string|in:low,medium,high',
        ]);

        // Chưa triển khai task cho Facebook -> trả về trống để FE hoạt động an toàn
        $perPage = $validated['per_page'] ?? 20;
        $page = $validated['page'] ?? 1;
        return response()->json([
            'data' => [
                'activities' => [],
                'pagination' => [
                    'current_page' => (int) $page,
                    'per_page' => (int) $perPage,
                    'total' => 0,
                    'last_page' => 0,
                    'from' => null,
                    'to' => null,
                ]
            ]
        ]);
    }

    public function bulkUpdateConnectionType(Request $request)
    {
        $validated = $request->validate([
            'account_ids' => 'required|array|min:1',
            'account_ids.*' => 'integer|exists:facebook_accounts,id',
            'connection_type' => 'required|string|in:wifi,4g',
        ]);
        $result = $this->service->bulkUpdateConnectionType($request->user(), $validated['account_ids'], $validated['connection_type']);
        return response()->json(['success' => true, 'data' => $result]);
    }

    public function runScenario(Request $request, FacebookAccount $facebookAccount)
    {
        $user = $request->user();
        // Only super-admin can run scenarios for accounts with null user_id, or users can run scenarios for their own accounts
        if (!$user->hasRole('super-admin') && ($facebookAccount->user_id !== $user->id)) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Validate scenario and device
        if (!$facebookAccount->scenario_id) {
            return response()->json(['message' => 'Account has no linked scenario.'], 422);
        }

        $validated = $request->validate([
            'device_id' => 'sometimes|exists:devices,id',
        ]);
        $deviceId = $validated['device_id'] ?? $facebookAccount->device_id;

        // Check device has running task
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

        $accountTaskService = app(\App\Services\AccountTaskService::class);
        $result = $accountTaskService->createTasksFromScenarioForFacebook(
            $facebookAccount,
            $deviceId,
            $user->id
        );

        return response()->json($result);
    }

    public function stopTasks(Request $request, FacebookAccount $facebookAccount)
    {
        $user = $request->user();
        // Only super-admin can stop tasks for accounts with null user_id, or users can stop tasks for their own accounts
        if (!$user->hasRole('super-admin') && ($facebookAccount->user_id !== $user->id)) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        try {
            $pendingTasks = $facebookAccount->pendingTasks();
            $runningTasks = $facebookAccount->runningTasks();

            $pendingCount = $pendingTasks->count();
            $runningCount = $runningTasks->count();

            // Xóa pending tasks
            $pendingTasks->delete();

            // Cập nhật running tasks thành cancelled
            $runningTasks->update([
                'status' => 'cancelled',
                'completed_at' => now()
            ]);

            return response()->json([
                'success' => true,
                'message' => "Đã dừng {$pendingCount} pending tasks và {$runningCount} running tasks",
                'data' => [
                    'cancelled_pending' => $pendingCount,
                    'cancelled_running' => $runningCount
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Stop Facebook Account Tasks Error', [
                'account_id' => $facebookAccount->id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi dừng tasks: ' . $e->getMessage()
            ]);
        }
    }

    public function bulkRunScenario(Request $request)
    {
        $validated = $request->validate([
            'account_ids' => 'required|array|min:1',
            'account_ids.*' => 'integer|exists:facebook_accounts,id',
        ]);

        $user = $request->user();
        $accountIds = $validated['account_ids'];

        // Filter accounts based on user permissions
        if (!$user->hasRole('super-admin')) {
            $accountIds = FacebookAccount::whereIn('id', $accountIds)
                ->where('user_id', $user->id)
                ->pluck('id')
                ->toArray();
        }

        if (empty($accountIds)) {
            return response()->json([
                'success' => false,
                'message' => 'Không có quyền truy cập tài khoản nào'
            ], 403);
        }

        $accountTaskService = app(\App\Services\AccountTaskService::class);
        $results = [];
        $successCount = 0;
        $errorCount = 0;

        foreach ($accountIds as $accountId) {
            $account = FacebookAccount::find($accountId);
            if (!$account) {
                $results[] = [
                    'account_id' => $accountId,
                    'success' => false,
                    'message' => 'Account không tồn tại'
                ];
                $errorCount++;
                continue;
            }

            $result = $accountTaskService->createTasksFromScenarioForFacebook(
                $account,
                $account->device_id,
                $user->id
            );
            $result['account_id'] = $accountId;
            $result['username'] = $account->username;

            $results[] = $result;

            if ($result['success']) {
                $successCount++;
            } else {
                $errorCount++;
            }
        }

        return response()->json([
            'success' => $successCount > 0,
            'message' => "Đã xử lý {$successCount} thành công, {$errorCount} thất bại",
            'data' => [
                'total' => count($accountIds),
                'success' => $successCount,
                'error' => $errorCount,
                'results' => $results
            ]
        ]);
    }

    public function bulkStopTasks(Request $request)
    {
        $validated = $request->validate([
            'account_ids' => 'required|array|min:1',
            'account_ids.*' => 'integer|exists:facebook_accounts,id',
        ]);

        $user = $request->user();
        $accountIds = $validated['account_ids'];

        // Filter accounts based on user permissions
        if (!$user->hasRole('super-admin')) {
            $accountIds = FacebookAccount::whereIn('id', $accountIds)
                ->where('user_id', $user->id)
                ->pluck('id')
                ->toArray();
        }

        if (empty($accountIds)) {
            return response()->json([
                'success' => false,
                'message' => 'Không có quyền truy cập tài khoản nào'
            ], 403);
        }

        $results = [];
        $successCount = 0;
        $errorCount = 0;

        foreach ($accountIds as $accountId) {
            $account = FacebookAccount::find($accountId);
            if (!$account) {
                $results[] = [
                    'account_id' => $accountId,
                    'success' => false,
                    'message' => 'Account không tồn tại'
                ];
                $errorCount++;
                continue;
            }

            try {
                $pendingTasks = $account->pendingTasks();
                $runningTasks = $account->runningTasks();

                $pendingCount = $pendingTasks->count();
                $runningCount = $runningTasks->count();

                // Xóa pending tasks
                $pendingTasks->delete();

                // Cập nhật running tasks thành cancelled
                $runningTasks->update([
                    'status' => 'cancelled',
                    'completed_at' => now()
                ]);

                $results[] = [
                    'account_id' => $accountId,
                    'username' => $account->username,
                    'success' => true,
                    'message' => "Đã dừng {$pendingCount} pending tasks và {$runningCount} running tasks",
                    'data' => [
                        'cancelled_pending' => $pendingCount,
                        'cancelled_running' => $runningCount
                    ]
                ];
                $successCount++;

            } catch (\Exception $e) {
                Log::error('Stop Facebook Account Tasks Error', [
                    'account_id' => $accountId,
                    'error' => $e->getMessage()
                ]);

                $results[] = [
                    'account_id' => $accountId,
                    'username' => $account->username,
                    'success' => false,
                    'message' => 'Lỗi khi dừng tasks: ' . $e->getMessage()
                ];
                $errorCount++;
            }
        }

        return response()->json([
            'success' => $successCount > 0,
            'message' => "Đã dừng tasks cho {$successCount} accounts thành công, {$errorCount} thất bại",
            'data' => [
                'total' => count($accountIds),
                'success' => $successCount,
                'error' => $errorCount,
                'results' => $results
            ]
        ]);
    }

    public function getAccountTasks(Request $request, FacebookAccount $facebookAccount)
    {
        $user = $request->user();
        // Only super-admin can view tasks for accounts with null user_id, or users can view tasks for their own accounts
        if (!$user->hasRole('super-admin') && ($facebookAccount->user_id !== $user->id)) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $tasks = $facebookAccount->accountTasks()
            ->with(['interactionScenario', 'device'])
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $tasks
        ]);
    }

    public function getAccountStatus(Request $request, FacebookAccount $facebookAccount)
    {
        $user = $request->user();
        // Only super-admin can view status for accounts with null user_id, or users can view status for their own accounts
        if (!$user->hasRole('super-admin') && ($facebookAccount->user_id !== $user->id)) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $runningTasks = $facebookAccount->runningTasks()->count();
        $pendingTasks = $facebookAccount->pendingTasks()->count();
        $completedTasks = $facebookAccount->accountTasks()->where('status', 'completed')->count();
        $failedTasks = $facebookAccount->accountTasks()->where('status', 'failed')->count();

        $latestTask = $facebookAccount->accountTasks()
            ->orderBy('updated_at', 'desc')
            ->first();

        $status = 'idle';
        $currentActivity = null;

        if ($runningTasks > 0) {
            $status = 'running';
            $currentActivity = $latestTask ? [
                'task_type' => $latestTask->task_type,
                'started_at' => $latestTask->started_at,
                'scenario' => $latestTask->interactionScenario?->name
            ] : null;
        } elseif ($pendingTasks > 0) {
            $status = 'pending';
            $currentActivity = $latestTask ? [
                'task_type' => $latestTask->task_type,
                'created_at' => $latestTask->created_at,
                'scenario' => $latestTask->interactionScenario?->name
            ] : null;
        }

        return response()->json([
            'success' => true,
            'data' => [
                'status' => $status,
                'current_activity' => $currentActivity,
                'stats' => [
                    'running_tasks' => $runningTasks,
                    'pending_tasks' => $pendingTasks,
                    'completed_tasks' => $completedTasks,
                    'failed_tasks' => $failedTasks,
                ]
            ]
        ]);
    }

    public function getAllTasks(Request $request)
    {
        $user = $request->user();

        // Build query for Facebook account tasks
        $query = \App\Models\AccountTask::whereNotNull('facebook_account_id')
            ->with(['facebookAccount', 'interactionScenario', 'device']);

        // Apply RBAC - only super-admin can see all tasks, others see only their own
        if (!$user->hasRole('super-admin')) {
            $query->whereHas('facebookAccount', function($q) use ($user) {
                $q->where('user_id', $user->id);
            });
        }

        // Apply filters
        if ($request->has('filter[status]') && $request->input('filter[status]')) {
            $query->where('status', $request->input('filter[status]'));
        }

        // Apply time range filter
        if ($request->has('time_range')) {
            $timeRange = $request->input('time_range');
            $now = now();

            switch ($timeRange) {
                case '24h':
                    $query->where('created_at', '>=', $now->subDay());
                    break;
                case '7d':
                    $query->where('created_at', '>=', $now->subWeek());
                    break;
                case '30d':
                    $query->where('created_at', '>=', $now->subMonth());
                    break;
            }
        }

        // Apply sorting
        $sortBy = $request->input('sort', '-created_at');
        if (str_starts_with($sortBy, '-')) {
            $query->orderBy(substr($sortBy, 1), 'desc');
        } else {
            $query->orderBy($sortBy, 'asc');
        }

        // Paginate results
        $perPage = $request->input('per_page', 20);
        $tasks = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $tasks
        ]);
    }

    public function getAllAccountsStatus(Request $request)
    {
        $user = $request->user();

        // Build query for Facebook accounts with all related data in one query
        $query = \App\Models\FacebookAccount::with([
            'accountTasks' => function($q) {
                $q->with('interactionScenario')
                  ->orderBy('updated_at', 'desc');
            }
        ]);

        // Apply RBAC - only super-admin can see all accounts, others see only their own
        if (!$user->hasRole('super-admin')) {
            $query->where('user_id', $user->id);
        }

        $accounts = $query->get();

        $result = [];
        foreach ($accounts as $account) {
            $tasks = $account->accountTasks;

            // Count tasks by status using collection methods (no additional queries)
            $runningTasks = $tasks->where('status', 'running')->count();
            $pendingTasks = $tasks->where('status', 'pending')->count();
            $completedTasks = $tasks->where('status', 'completed')->count();
            $failedTasks = $tasks->where('status', 'failed')->count();

            // Get latest task (already ordered by updated_at desc)
            $latestTask = $tasks->first();

            $status = 'idle';
            $currentActivity = null;

            if ($runningTasks > 0) {
                $status = 'running';
                $currentActivity = $latestTask ? [
                    'task_type' => $latestTask->task_type,
                    'started_at' => $latestTask->started_at,
                    'scenario' => $latestTask->interactionScenario?->name
                ] : null;
            } elseif ($pendingTasks > 0) {
                $status = 'pending';
                $currentActivity = $latestTask ? [
                    'task_type' => $latestTask->task_type,
                    'created_at' => $latestTask->created_at,
                    'scenario' => $latestTask->interactionScenario?->name
                ] : null;
            }

            $result[] = [
                'account_id' => $account->id,
                'status' => $status,
                'current_activity' => $currentActivity,
                'stats' => [
                    'running_tasks' => $runningTasks,
                    'pending_tasks' => $pendingTasks,
                    'completed_tasks' => $completedTasks,
                    'failed_tasks' => $failedTasks,
                ]
            ];
        }

        return response()->json([
            'success' => true,
            'data' => $result
        ]);
    }

    public function getBatchData(Request $request)
    {
        $user = $request->user();

        // Get all data needed for Facebook account management in one request
        $query = \App\Models\FacebookAccount::with([
            'accountTasks' => function($q) {
                $q->with('interactionScenario')
                  ->orderBy('updated_at', 'desc');
            },
            'interactionScenario',
            'proxy',
            'device'
        ]);

        // Apply RBAC
        if (!$user->hasRole('super-admin')) {
            $query->where('user_id', $user->id);
        }

        $accounts = $query->get();

        // Get stats
        $totalAccounts = $accounts->count();
        $activeAccounts = $accounts->where('status', 'active')->count();
        $inactiveAccounts = $accounts->where('status', 'inactive')->count();
        $runningTasks = $accounts->sum(function($account) {
            return $account->accountTasks->where('status', 'running')->count();
        });

        // Get proxies
        $proxies = \App\Models\Proxy::where('status', 'active')
            ->select('id', 'name', 'host', 'port', 'type')
            ->get()
            ->map(function($proxy) {
                return [
                    'value' => $proxy->id,
                    'label' => $proxy->name,
                    'data' => $proxy
                ];
            });

        // Process accounts with status
        $accountsWithStatus = [];
        foreach ($accounts as $account) {
            $tasks = $account->accountTasks;
            $runningTaskCount = $tasks->where('status', 'running')->count();
            $pendingTaskCount = $tasks->where('status', 'pending')->count();
            $completedTaskCount = $tasks->where('status', 'completed')->count();
            $failedTaskCount = $tasks->where('status', 'failed')->count();

            $latestTask = $tasks->first();
            $status = 'idle';
            $currentActivity = null;

            if ($runningTaskCount > 0) {
                $status = 'running';
                $currentActivity = $latestTask ? [
                    'task_type' => $latestTask->task_type,
                    'started_at' => $latestTask->started_at,
                    'scenario' => $latestTask->interactionScenario?->name
                ] : null;
            } elseif ($pendingTaskCount > 0) {
                $status = 'pending';
                $currentActivity = $latestTask ? [
                    'task_type' => $latestTask->task_type,
                    'created_at' => $latestTask->created_at,
                    'scenario' => $latestTask->interactionScenario?->name
                ] : null;
            }

            $accountsWithStatus[] = [
                'account' => $account,
                'status' => $status,
                'current_activity' => $currentActivity,
                'stats' => [
                    'running_tasks' => $runningTaskCount,
                    'pending_tasks' => $pendingTaskCount,
                    'completed_tasks' => $completedTaskCount,
                    'failed_tasks' => $failedTaskCount,
                ]
            ];
        }

        return response()->json([
            'success' => true,
            'data' => [
                'accounts' => $accountsWithStatus,
                'stats' => [
                    'totalAccounts' => $totalAccounts,
                    'activeAccounts' => $activeAccounts,
                    'inactiveAccounts' => $inactiveAccounts,
                    'runningTasks' => $runningTasks,
                    'performance' => $totalAccounts > 0 ? round(($activeAccounts / $totalAccounts) * 100) : 0
                ],
                'proxies' => $proxies
            ]
        ]);
    }

    public function runInteractions(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'account_ids' => 'required|array|min:1',
            'account_ids.*' => 'integer|exists:facebook_accounts,id',
            'action_type' => 'required|string|in:specific_post_interaction,newsfeed_interaction,group_post_spam',
            'config' => 'required|array',
        ]);

        // RBAC filter account ids
        $accountIds = $validated['account_ids'];
        if (!$user->hasRole('super-admin')) {
            $accountIds = FacebookAccount::whereIn('id', $accountIds)
                ->where('user_id', $user->id)
                ->pluck('id')
                ->toArray();
        }

        if (empty($accountIds)) {
            return response()->json([
                'success' => false,
                'message' => 'Không có quyền cho các tài khoản được chọn'
            ], 403);
        }

        $createdIds = [];
        DB::beginTransaction();
        try {
            foreach ($accountIds as $accountId) {
                $task = AccountTask::create([
                    'facebook_account_id' => $accountId,
                    'task_type' => 'facebook_interaction',
                    'parameters' => [
                        'action_type' => $validated['action_type'],
                        'config' => $validated['config'],
                    ],
                    'priority' => 'medium',
                    'status' => 'pending',
                    'scheduled_at' => now(),
                    'retry_count' => 0,
                    'max_retries' => 0,
                ]);
                $createdIds[] = $task->id;
            }
            DB::commit();
        } catch (\Throwable $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }

        return response()->json([
            'success' => true,
            'created' => count($createdIds),
            'task_ids' => $createdIds,
        ]);
    }

    public function assignScenario(Request $request, FacebookAccount $facebookAccount)
    {
        $user = $request->user();
        // Only super-admin can assign scenarios to accounts with null user_id, or users can assign scenarios to their own accounts
        if (!$user->hasRole('super-admin') && ($facebookAccount->user_id !== $user->id)) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'scenario_id' => 'required|integer|exists:interaction_scenarios,id',
        ]);

        // Kiểm tra kịch bản có phải Facebook không
        $scenario = \App\Models\InteractionScenario::find($validated['scenario_id']);
        if (!$scenario || $scenario->platform !== 'facebook') {
            return response()->json([
                'success' => false,
                'message' => 'Kịch bản không hợp lệ hoặc không phải kịch bản Facebook'
            ], 400);
        }

        try {
            // Update the account's scenario
            $facebookAccount->update([
                'scenario_id' => $validated['scenario_id']
            ]);

            // Load the scenario relationship
            $facebookAccount->load('interactionScenario');

            return response()->json([
                'success' => true,
                'message' => 'Đã gán kịch bản thành công',
                'data' => [
                    'account_id' => $facebookAccount->id,
                    'scenario' => $facebookAccount->interactionScenario
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Có lỗi xảy ra khi gán kịch bản: ' . $e->getMessage()
            ], 500);
        }
    }

    public function stopScenario(Request $request, FacebookAccount $facebookAccount)
    {
        $user = $request->user();
        // Only super-admin can stop scenarios for accounts with null user_id, or users can stop scenarios for their own accounts
        if (!$user->hasRole('super-admin') && ($facebookAccount->user_id !== $user->id)) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        try {
            // Stop all running tasks for this account
            $facebookAccount->accountTasks()
                ->where('status', 'running')
                ->update([
                    'status' => 'completed',
                    'completed_at' => now()
                ]);

            // Remove scenario assignment
            $facebookAccount->update([
                'scenario_id' => null
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Đã dừng kịch bản thành công',
                'data' => [
                    'account_id' => $facebookAccount->id,
                    'scenario_id' => null
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Có lỗi xảy ra khi dừng kịch bản: ' . $e->getMessage()
            ], 500);
        }
    }

    public function destroy(Request $request, FacebookAccount $facebookAccount)
    {
        $user = $request->user();
        // Only super-admin can delete accounts with null user_id, or users can delete their own accounts
        if (!$user->hasRole('super-admin') && ($facebookAccount->user_id !== $user->id)) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        try {
            // Stop all running tasks for this account first
            $facebookAccount->accountTasks()
                ->where('status', 'running')
                ->update([
                    'status' => 'completed',
                    'completed_at' => now()
                ]);

            // Delete all related tasks
            $facebookAccount->accountTasks()->delete();

            // Delete the account
            $accountId = $facebookAccount->id;
            $accountUsername = $facebookAccount->username;
            $facebookAccount->delete();

            return response()->json([
                'success' => true,
                'message' => "Đã xóa tài khoản {$accountUsername} thành công",
                'data' => [
                    'account_id' => $accountId,
                    'deleted_at' => now()
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Có lỗi xảy ra khi xóa tài khoản: ' . $e->getMessage()
            ], 500);
        }
    }

    public function bulkRun(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'account_ids' => 'required|array',
            'account_ids.*' => 'integer|exists:facebook_accounts,id',
        ]);

        try {
            $accountIds = $validated['account_ids'];

            // Check permissions for each account
            if (!$user->hasRole('super-admin')) {
                $userAccountIds = FacebookAccount::where('user_id', $user->id)->pluck('id')->toArray();
                $unauthorizedIds = array_diff($accountIds, $userAccountIds);

                if (!empty($unauthorizedIds)) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Không có quyền truy cập một số tài khoản'
                    ], 403);
                }
            }

            // Start scenarios for all accounts
            $successCount = 0;
            $errors = [];

            foreach ($accountIds as $accountId) {
                try {
                    $account = FacebookAccount::find($accountId);
                    if ($account && $account->scenario_id) {
                        // Create account task
                        AccountTask::create([
                            'facebook_account_id' => $accountId,
                            'interaction_scenario_id' => $account->scenario_id,
                            'task_type' => 'scenario',
                            'status' => 'running',
                            'started_at' => now(),
                        ]);
                        $successCount++;
                    } else {
                        $errors[] = "Tài khoản ID {$accountId} không có kịch bản được gán";
                    }
                } catch (\Exception $e) {
                    $errors[] = "Lỗi khi khởi chạy tài khoản ID {$accountId}: " . $e->getMessage();
                }
            }

            return response()->json([
                'success' => true,
                'message' => "Đã khởi chạy {$successCount}/" . count($accountIds) . " tài khoản",
                'data' => [
                    'success_count' => $successCount,
                    'total_count' => count($accountIds),
                    'errors' => $errors
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Có lỗi xảy ra khi khởi chạy tài khoản: ' . $e->getMessage()
            ], 500);
        }
    }

    public function bulkDelete(Request $request)
    {
        $validated = $request->validate([
            'ids' => 'required|array|min:1',
            'ids.*' => 'integer|exists:facebook_accounts,id',
        ]);

        $user = $request->user();
        $ids = $validated['ids'];

        if (!$user->hasRole('super-admin')) {
            $ids = FacebookAccount::whereIn('id', $ids)
                ->where('user_id', $user->id)
                ->pluck('id')
                ->toArray();
        }

        $success = 0; $errors = [];
        foreach ($ids as $id) {
            try {
                /** @var FacebookAccount $acc */
                $acc = FacebookAccount::find($id);
                if (!$acc) { $errors[] = "{$id}: not found"; continue; }
                // stop running tasks and delete all tasks
                $acc->accountTasks()->where('status', 'running')->update(['status' => 'completed', 'completed_at' => now()]);
                $acc->accountTasks()->delete();
                $acc->delete();
                $success++;
            } catch (\Throwable $e) {
                $errors[] = "{$id}: " . $e->getMessage();
            }
        }

        return response()->json([
            'success' => $success > 0,
            'message' => "Đã xóa {$success}/" . count($validated['ids']) . " tài khoản",
            'data' => [ 'success' => $success, 'total' => count($validated['ids']), 'errors' => $errors ],
        ]);
    }

    public function bulkRunV2(Request $request)
    {
        $validated = $request->validate([
            'ids' => 'required|array|min:1',
            'ids.*' => 'integer|exists:facebook_accounts,id',
            'scenario_id' => 'required|integer|exists:interaction_scenarios,id',
            'device_id' => 'sometimes|nullable|integer|exists:devices,id',
        ]);

        $user = $request->user();
        $ids = $validated['ids'];
        $scenarioId = $validated['scenario_id'];
        $deviceId = $validated['device_id'] ?? null;

        if (!$user->hasRole('super-admin')) {
            $ids = FacebookAccount::whereIn('id', $ids)
                ->where('user_id', $user->id)
                ->pluck('id')
                ->toArray();
        }

        $success = 0; $errors = [];
        $accountTaskService = app(\App\Services\AccountTaskService::class);
        foreach ($ids as $id) {
            try {
                $acc = FacebookAccount::find($id);
                if (!$acc) { $errors[] = "{$id}: not found"; continue; }
                // assign scenario before run
                $acc->update(['scenario_id' => $scenarioId]);
                $result = $accountTaskService->createTasksFromScenarioForFacebook($acc, $deviceId ?: $acc->device_id, $user->id);
                if (!empty($result['success'])) $success++; else $errors[] = "{$id}: " . ($result['message'] ?? 'failed');
            } catch (\Throwable $e) {
                $errors[] = "{$id}: " . $e->getMessage();
            }
        }

        return response()->json([
            'success' => $success > 0,
            'message' => "Đã chạy {$success}/" . count($validated['ids']) . " tài khoản",
            'data' => [ 'success' => $success, 'total' => count($validated['ids']), 'errors' => $errors ],
        ]);
    }

    public function bulkStopScenario(Request $request)
    {
        $validated = $request->validate([
            'ids' => 'required|array|min:1',
            'ids.*' => 'integer|exists:facebook_accounts,id',
        ]);
        $user = $request->user();
        $ids = $validated['ids'];
        if (!$user->hasRole('super-admin')) {
            $ids = FacebookAccount::whereIn('id', $ids)
                ->where('user_id', $user->id)
                ->pluck('id')
                ->toArray();
        }
        $success = 0; $errors = [];
        foreach ($ids as $id) {
            try {
                $acc = FacebookAccount::find($id);
                if (!$acc) { $errors[] = "{$id}: not found"; continue; }
                $acc->accountTasks()->where('status', 'running')->update(['status' => 'completed', 'completed_at' => now()]);
                $acc->update(['scenario_id' => null]);
                $success++;
            } catch (\Throwable $e) { $errors[] = "{$id}: " . $e->getMessage(); }
        }
        return response()->json([
            'success' => $success > 0,
            'message' => "Đã dừng kịch bản cho {$success}/" . count($validated['ids']) . " tài khoản",
            'data' => [ 'success' => $success, 'total' => count($validated['ids']), 'errors' => $errors ],
        ]);
    }

    public function bulkAssignScenario(Request $request)
    {
        $validated = $request->validate([
            'ids' => 'required|array|min:1',
            'ids.*' => 'integer',
            'scenario_id' => 'required|integer|exists:interaction_scenarios,id',
        ]);
        $user = $request->user();
        $ids = $validated['ids'];
        if (!$user->hasRole('super-admin')) {
            $ids = FacebookAccount::whereIn('id', $ids)
                ->where('user_id', $user->id)
                ->pluck('id')
                ->toArray();
        }
        $success = 0; $errors = [];
        foreach ($ids as $id) {
            try {
                $acc = FacebookAccount::find($id);
                if (!$acc) { $errors[] = "{$id}: not found"; continue; }
                $acc->update(['scenario_id' => $validated['scenario_id']]);
                $success++;
            } catch (\Throwable $e) { $errors[] = "{$id}: " . $e->getMessage(); }
        }
        return response()->json([
            'success' => $success > 0,
            'message' => "Đã gán kịch bản cho {$success}/" . count($validated['ids']) . " tài khoản",
            'data' => [ 'success' => $success, 'total' => count($validated['ids']), 'errors' => $errors ],
        ]);
    }

    public function bulkAssignDevice(Request $request)
    {
        $validated = $request->validate([
            'ids' => 'required|array|min:1',
            'ids.*' => 'integer|exists:facebook_accounts,id',
            'device_id' => 'required|integer|exists:devices,id',
        ]);
        $user = $request->user();
        $ids = $validated['ids'];
        if (!$user->hasRole('super-admin')) {
            $ids = FacebookAccount::whereIn('id', $ids)
                ->where('user_id', $user->id)
                ->pluck('id')
                ->toArray();
        }
        $success = 0; $errors = [];
        foreach ($ids as $id) {
            try {
                $acc = FacebookAccount::find($id);
                if (!$acc) { $errors[] = "{$id}: not found"; continue; }
                $acc->update(['device_id' => $validated['device_id']]);
                $success++;
            } catch (\Throwable $e) { $errors[] = "{$id}: " . $e->getMessage(); }
        }
        return response()->json([
            'success' => $success > 0,
            'message' => "Đã gán thiết bị cho {$success}/" . count($validated['ids']) . " tài khoản",
            'data' => [ 'success' => $success, 'total' => count($validated['ids']), 'errors' => $errors ],
        ]);
    }
}



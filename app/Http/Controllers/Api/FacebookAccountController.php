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

        $taskService = app(\App\Services\FacebookAccountTaskService::class);
        $result = $taskService->runScenario($facebookAccount);

        return response()->json($result);
    }

    public function stopTasks(Request $request, FacebookAccount $facebookAccount)
    {
        $user = $request->user();
        // Only super-admin can stop tasks for accounts with null user_id, or users can stop tasks for their own accounts
        if (!$user->hasRole('super-admin') && ($facebookAccount->user_id !== $user->id)) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $taskService = app(\App\Services\FacebookAccountTaskService::class);
        $result = $taskService->stopAllTasks($facebookAccount);

        return response()->json($result);
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

        $taskService = app(\App\Services\FacebookAccountTaskService::class);
        $result = $taskService->bulkRunScenario($accountIds);

        return response()->json($result);
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

        $taskService = app(\App\Services\FacebookAccountTaskService::class);
        $result = $taskService->bulkStopTasks($accountIds);

        return response()->json($result);
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
}



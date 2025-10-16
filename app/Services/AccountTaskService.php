<?php

namespace App\Services;

use App\Models\AccountTask;
use App\Queries\BaseQuery;
use App\Repositories\AccountTaskRepositoryInterface;
use App\Events\TaskDispatchedToDevice;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Log;

class AccountTaskService
{
    protected $accountTaskRepository;

    public function __construct(AccountTaskRepositoryInterface $accountTaskRepository)
    {
        $this->accountTaskRepository = $accountTaskRepository;
    }

    public function getAll(Request $request): LengthAwarePaginator
    {
        \Log::info('🔍 AccountTaskService::getAll - Request params:', $request->all());

        $query = $this->accountTaskRepository->getModel()->query()
            ->with(['tiktokAccount' => function($q) {
                $q->select('id', 'username', 'nickname', 'avatar_url');
            }])
            ->orderBy('created_at', 'desc'); // Sắp xếp từ mới nhất đến cũ nhất

        // Áp dụng filter trực tiếp thay vì dùng BaseQuery.handle()
        if ($request->has('status') && !empty($request->input('status'))) {
            $query->where('status', $request->input('status'));
            \Log::info('🔍 AccountTaskService::getAll - Applied status filter:', ['status' => $request->input('status')]);
        }

        if ($request->has('user_id') && !empty($request->input('user_id'))) {
            $query->whereHas('tiktokAccount', function($q) use ($request) {
                $q->where('user_id', $request->input('user_id'));
            });
            \Log::info('🔍 AccountTaskService::getAll - Applied user_id filter:', ['user_id' => $request->input('user_id')]);
        }

        $perPage = $request->input('per_page', 20);
        $result = $query->paginate($perPage);

        \Log::info('📊 AccountTaskService::getAll - Query result:', [
            'total' => $result->total(),
            'per_page' => $perPage,
            'current_page' => $result->currentPage(),
            'last_page' => $result->lastPage(),
            'first_item_id' => $result->first() ? $result->first()->id : null,
            'first_item_tiktok_account_id' => $result->first() ? $result->first()->tiktok_account_id : null,
            'first_item_tiktok_account_loaded' => $result->first() ? ($result->first()->tiktokAccount ? 'YES' : 'NO') : null,
        ]);

        // Log chi tiết task đầu tiên nếu có
        if ($result->first()) {
            $firstTask = $result->first();
            \Log::info('🔍 AccountTaskService::getAll - First task details:', [
                'task_id' => $firstTask->id,
                'task_type' => $firstTask->task_type,
                'status' => $firstTask->status,
                'tiktok_account_id' => $firstTask->tiktok_account_id,
                'tiktok_account_username' => $firstTask->tiktokAccount ? $firstTask->tiktokAccount->username : 'NULL',
                'tiktok_account_nickname' => $firstTask->tiktokAccount ? $firstTask->tiktokAccount->nickname : 'NULL',
                'tiktok_account_loaded' => $firstTask->tiktokAccount ? 'YES' : 'NO',
            ]);
        }

        return $result;
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
                'message' => 'Kịch bản không có kịch bản.',
            ];
        }

        // Không tạo thêm task nếu thiết bị đang có task chạy
        if ($deviceId) {
            $hasRunningTaskOnDevice = AccountTask::where('device_id', $deviceId)
                ->where('status', 'running')
                ->exists();
            if ($hasRunningTaskOnDevice) {
                return [
                    'success' => false,
                    'message' => 'Thiết bị đang có task chạy, không tạo thêm task mới.',
                ];
            }
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

            // Tạo payload cho mỗi task với chỉ 1 script
            $singleScriptPayload = [
                'account_username' => $account->username,
                'scenario_name' => $scenario->name,
                'device_id' => $deviceId,
                'created_by' => $createdByUserId,
                'scenario_scripts' => [
                    [
                        'id' => $scriptModel->id,
                        'type' => $script['type'] ?? ($script['task_type'] ?? 'unknown'),
                        'name' => $script['name'] ?? ($script['type'] ?? 'unknown'),
                        'description' => $script['description'] ?? null,
                        'order' => $scriptModel->order ?? $order,
                        'is_active' => $script['is_active'] ?? true,
                        'delay_min' => $script['delay_min'] ?? null,
                        'delay_max' => $script['delay_max'] ?? null,
                        'parameters' => $script['parameters'] ?? $script,
                        'success_count' => 0,
                        'failure_count' => 0,
                        'last_executed_at' => null,
                        'success_rate' => 0,
                    ]
                ],
            ];

            $taskData = [
                'tiktok_account_id' => $account->id,
                'interaction_scenario_id' => $scenario->id,
                'device_id' => $deviceId,
                'task_type' => $taskType,
                'parameters' => json_encode($singleScriptPayload), // Lưu chỉ 1 script
                'priority' => 'medium',
                'status' => 'pending',
                'scheduled_at' => null,
            ];

            try {
                $task = $this->accountTaskRepository->create($taskData);
                $createdTasks[] = $task;

                // Dispatch event for real-time updates
                if ($deviceId) {
                    // Lấy device thực tế để có device_id (mã máy)
                    $device = \App\Models\Device::find($deviceId);
                    if ($device && $device->device_id) {
                        Log::info('Dispatching event for device: ' . $device->device_id);
                        event(new TaskDispatchedToDevice($device->device_id));
                    }
                }

            } catch (\Exception $e) {
                throw $e;
            }
            $order++;
        }

        // Return complete payload for frontend
        $completePayload = [
            'account_username' => $account->username,
            'scenario_name' => $scenario->name,
            'device_id' => $deviceId,
            'created_by' => $createdByUserId,
            'scenario_scripts' => $scenarioScripts,
        ];

        return [
            'success' => true,
            'message' => 'Đã tạo task từ kịch bản thành công',
            'data' => $completePayload,
        ];
    }

    /**
     * Create pending account tasks for given Facebook account from its linked scenario scripts.
     * Returns a summary object with account info and scenario scripts used, similar to FE expectation.
     */
    public function createTasksFromScenarioForFacebook(\App\Models\FacebookAccount $account, ?int $deviceId, int $createdByUserId): array
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
                'message' => 'Kịch bản không có kịch bản.',
            ];
        }

        // Không tạo thêm task nếu thiết bị đang có task chạy
        if ($deviceId) {
            $hasRunningTaskOnDevice = AccountTask::where('device_id', $deviceId)
                ->where('status', 'running')
                ->exists();
            if ($hasRunningTaskOnDevice) {
                return [
                    'success' => false,
                    'message' => 'Thiết bị đang có task chạy, không tạo thêm task mới.',
                ];
            }
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

            // Tạo payload cho mỗi task với chỉ 1 script
            $singleScriptPayload = [
                'account_username' => $account->username,
                'scenario_name' => $scenario->name,
                'device_id' => $deviceId,
                'created_by' => $createdByUserId,
                'scenario_scripts' => [
                    [
                        'id' => $scriptModel->id,
                        'type' => $script['type'] ?? ($script['task_type'] ?? 'unknown'),
                        'name' => $script['name'] ?? ($script['type'] ?? 'unknown'),
                        'description' => $script['description'] ?? null,
                        'order' => $scriptModel->order ?? $order,
                        'is_active' => $script['is_active'] ?? true,
                        'delay_min' => $script['delay_min'] ?? null,
                        'delay_max' => $script['delay_max'] ?? null,
                        'parameters' => $script['parameters'] ?? $script,
                        'success_count' => 0,
                        'failure_count' => 0,
                        'last_executed_at' => null,
                        'success_rate' => 0,
                    ]
                ],
            ];

            $taskData = [
                'facebook_account_id' => $account->id,
                'interaction_scenario_id' => $scenario->id,
                'device_id' => $deviceId,
                'task_type' => $taskType,
                'parameters' => json_encode($singleScriptPayload), // Lưu chỉ 1 script
                'priority' => 'medium',
                'status' => 'pending',
                'scheduled_at' => null,
            ];

            try {
                $task = $this->accountTaskRepository->create($taskData);
                $createdTasks[] = $task;

                // Dispatch event for real-time updates
                if ($deviceId) {
                    // Lấy device thực tế để có device_id (mã máy)
                    $device = \App\Models\Device::find($deviceId);
                    if ($device && $device->device_id) {
                        Log::info('Dispatching event for device: ' . $device->device_id);
                        event(new TaskDispatchedToDevice($device->device_id));
                    }
                }

            } catch (\Exception $e) {
                throw $e;
            }
            $order++;
        }

        // Return complete payload for frontend
        $completePayload = [
            'account_username' => $account->username,
            'scenario_name' => $scenario->name,
            'device_id' => $deviceId,
            'created_by' => $createdByUserId,
            'scenario_scripts' => $scenarioScripts,
        ];

        return [
            'success' => true,
            'message' => 'Đã tạo task từ kịch bản thành công',
            'data' => $completePayload,
        ];
    }

    /**
     * Get recent activities for TikTok accounts
     */
    public function getRecentActivities(array $params = []): array
    {
        try {
            $userId = $params['user_id'] ?? null;
            $page = $params['page'] ?? 1;
            $perPage = $params['per_page'] ?? 20;
            $status = $params['status'] ?? null;
            $startDate = $params['start_date'] ?? null;
            $accountId = $params['account_id'] ?? null;

            // Build query
            $query = AccountTask::with(['tiktokAccount:id,username,display_name,nickname'])
                ->whereHas('tiktokAccount', function ($q) use ($userId) {
                    if ($userId) {
                        $q->where('user_id', $userId);
                    }
                });

            // Filter by status
            if ($status) {
                $query->where('status', $status);
            }

            // Filter by date range
            if ($startDate) {
                $query->where('created_at', '>=', $startDate);
            }

            // Filter by account
            if ($accountId) {
                $query->where('tiktok_account_id', $accountId);
            }

            // Order by latest first
            $query->orderBy('created_at', 'desc');

            // Get paginated results
            $tasks = $query->paginate($perPage, ['*'], 'page', $page);

            // Transform data for frontend
            $activities = $tasks->getCollection()->map(function ($task) {
                $parameters = json_decode($task->parameters, true) ?? [];

                // Get action details from parameters
                $actionName = $parameters['name'] ?? $task->task_type;
                $actionDetails = $this->getActionDetails($task->task_type, $parameters);

                return [
                    'id' => $task->id,
                    'account' => [
                        'username' => $task->tiktokAccount->username,
                        'display_name' => $task->tiktokAccount->display_name ?? $task->tiktokAccount->nickname ?? $task->tiktokAccount->username
                    ],
                    'action' => $task->task_type,
                    'action_name' => $actionName,
                    'status' => $task->status,
                    'details' => $actionDetails['details'],
                    'target' => $actionDetails['target'],
                    'timestamp' => $task->created_at,
                    'started_at' => $task->started_at,
                    'completed_at' => $task->completed_at,
                    'duration' => $task->started_at && $task->completed_at
                        ? $task->completed_at->diffInSeconds($task->started_at)
                        : 0,
                    'error_message' => $task->error_message,
                    'progress' => $task->status === 'running' ? $this->calculateProgress($task) : null
                ];
            });

            return [
                'success' => true,
                'data' => [
                    'activities' => $activities,
                    'pagination' => [
                        'current_page' => $tasks->currentPage(),
                        'per_page' => $tasks->perPage(),
                        'total' => $tasks->total(),
                        'last_page' => $tasks->lastPage(),
                        'from' => $tasks->firstItem(),
                        'to' => $tasks->lastItem()
                    ]
                ]
            ];

        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => 'Lỗi khi lấy dữ liệu hoạt động: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Get action details for display
     */
    private function getActionDetails(string $taskType, array $parameters): array
    {
        $details = '';
        $target = '';

        switch ($taskType) {
            case 'follow_user':
                $details = 'Đã follow người dùng';
                $target = $parameters['user_list'] ?? $parameters['keyword_list'] ?? 'Người dùng';
                break;
            case 'unfollow_user':
                $details = 'Đã bỏ follow người dùng';
                $target = $parameters['user_list'] ?? 'Người dùng';
                break;
            case 'like_video':
                $details = 'Đã thích video';
                $target = $parameters['video_url'] ?? 'Video';
                break;
            case 'comment_video':
                $details = 'Đã bình luận video';
                $target = $parameters['video_url'] ?? 'Video';
                break;
            case 'share_video':
                $details = 'Đã chia sẻ video';
                $target = $parameters['video_url'] ?? 'Video';
                break;
            case 'create_post':
                $details = 'Đã tạo bài viết mới';
                $target = $parameters['title'] ?? 'Bài viết';
                break;
            case 'live_interaction':
                $details = 'Tương tác live stream';
                $target = $parameters['live_url'] ?? 'Live stream';
                break;
            case 'notification':
                $details = 'Đã đọc thông báo';
                $target = $parameters['notification_count_from'] ?? 'Thông báo';
                break;
            case 'change_bio':
                $details = 'Đã cập nhật tiểu sử';
                $target = 'Tiểu sử';
                break;
            case 'update_avatar':
                $details = 'Đã cập nhật avatar';
                $target = 'Avatar';
                break;
            case 'change_name':
                $details = 'Đã thay đổi tên';
                $target = 'Tên hiển thị';
                break;
            default:
                $details = 'Thực hiện hành động';
                $target = $taskType;
        }

        return [
            'details' => $details,
            'target' => $target
        ];
    }

    /**
     * Calculate progress for running tasks
     */
    private function calculateProgress(AccountTask $task): int
    {
        if (!$task->started_at) {
            return 0;
        }

        $now = now();
        $startTime = $task->started_at;
        $elapsed = $now->diffInSeconds($startTime);

        // Estimate progress based on elapsed time (max 90% for running tasks)
        $estimatedDuration = 300; // 5 minutes default
        $progress = min(90, ($elapsed / $estimatedDuration) * 100);

        return (int) $progress;
    }
}

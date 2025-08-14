<?php

namespace App\Services;

use App\Models\TiktokAccount;
use App\Models\AccountTask;
use App\Queries\BaseQuery;
use App\Repositories\TiktokAccountRepositoryInterface;
use Illuminate\Http\Request;
use Carbon\Carbon;

class TiktokAccountService
{
    protected $repository;

    public function __construct(TiktokAccountRepositoryInterface $repository)
    {
        $this->repository = $repository;
    }

    public function getAll(Request $request)
    {
        $query = $this->repository->getModel()->newQuery();
        
        // Chỉ đếm pending tasks
        $query->withCount([
            'pendingTasks as pending_tasks_count'
        ]);

        // Load scenario và device của account, cùng với pending tasks
        $query->with([
            'device', // Device được gán cho account
            'interactionScenario', // Scenario của account
            'pendingTasks' => function($query) {
                $query->with(['device'])
                      ->orderBy('priority', 'desc')
                      ->orderBy('created_at', 'asc');
            }
        ]);

        // Xử lý filter theo task status (chỉ pending)
        $this->applyTaskFilters($query, $request);

        $result = (new BaseQuery($query, $request))->paginate();
        
        // Thêm thông tin phân tích task cho mỗi account
        if ($result->items()) {
            $result->getCollection()->transform(function ($account) {
                return $this->addTaskAnalysis($account);
            });
        }
        
        return $result;
    }

    /**
     * Apply task-related filters to the query (chỉ cho pending tasks)
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @param Request $request
     * @return void
     */
    private function applyTaskFilters($query, Request $request)
    {
        // Filter theo has_pending_tasks
        if ($request->has('filter.has_pending_tasks')) {
            $hasPendingTasks = filter_var($request->input('filter.has_pending_tasks'), FILTER_VALIDATE_BOOLEAN);
            if ($hasPendingTasks) {
                $query->whereHas('pendingTasks');
            } else {
                $query->whereDoesntHave('pendingTasks');
            }
        }

        // Filter theo task_type trong pending tasks
        if ($request->has('filter.pending_task_type')) {
            $taskType = $request->input('filter.pending_task_type');
            $query->whereHas('pendingTasks', function($q) use ($taskType) {
                $q->where('task_type', $taskType);
            });
        }

        // Filter theo priority trong pending tasks
        if ($request->has('filter.pending_task_priority')) {
            $priority = $request->input('filter.pending_task_priority');
            $query->whereHas('pendingTasks', function($q) use ($priority) {
                $q->where('priority', $priority);
            });
        }

        // Filter theo device_id trong pending tasks
        if ($request->has('filter.pending_task_device_id')) {
            $deviceId = $request->input('filter.pending_task_device_id');
            $query->whereHas('pendingTasks', function($q) use ($deviceId) {
                $q->where('device_id', $deviceId);
            });
        }

        // Filter theo scenario_id của account
        if ($request->has('filter.scenario_id')) {
            $scenarioId = $request->input('filter.scenario_id');
            $query->where('scenario_id', $scenarioId);
        }

        // Filter theo task_status (chỉ pending hoặc no_pending)
        if ($request->has('filter.task_status')) {
            $taskStatus = $request->input('filter.task_status');
            
            switch ($taskStatus) {
                case 'pending':
                    $query->whereHas('pendingTasks');
                    break;
                    
                case 'no_pending':
                    $query->whereDoesntHave('pendingTasks');
                    break;
            }
        }
    }

    /**
     * Create a new tiktok account
     *
     * @param array $data
     * @return TiktokAccount
     */
    public function createTiktokAccount(array $data)
    {
        return $this->repository->create($data);
    }

    /**
     * Update a tiktok account
     *
     * @param TiktokAccount $tiktokAccount
     * @param array $data
     * @return TiktokAccount
     */
    public function updateTiktokAccount(TiktokAccount $tiktokAccount, array $data)
    {
        // Filter data to only include fields that exist in the model's fillable array
        $fillableFields = $tiktokAccount->getFillable();
        $filteredData = array_intersect_key($data, array_flip($fillableFields));
        
        return $this->repository->update($tiktokAccount, $filteredData);
    }

    /**
     * Delete a tiktok account
     *
     * @param TiktokAccount $tiktokAccount
     * @return bool
     */
    public function deleteTiktokAccount(TiktokAccount $tiktokAccount)
    {
        return $this->repository->delete($tiktokAccount);
    }

    /**
     * Delete multiple tiktok accounts
     *
     * @param array $ids
     * @return int
     */
    public function deleteMultiple(array $ids)
    {
        return $this->repository->deleteMultiple($ids);
    }

    /**
     * Update status for multiple tiktok accounts
     *
     * @param array $ids
     * @param string $status
     * @return int
     */
    public function updateStatusMultiple(array $ids, string $status)
    {
        return $this->repository->updateStatusMultiple($ids, $status);
    }

    /**
     * Import multiple tiktok accounts from formatted string
     *
     * @param array $data
     * @return array
     */
    public function importAccounts(array $data)
    {

        $accountList = $data['accountList'];
        $format = $data['format'] ?? 'legacy';
        $lines = explode("\n", $accountList);
        $importedCount = 0;
        $failedCount = 0;
        $errors = [];
        $importedAccounts = [];
        $failedAccounts = [];


        foreach ($lines as $index => $line) {
            $line = trim($line);
            if (empty($line)) {
                continue;
            }

            try {
                $parsedData = $this->parseAccountLine($line, $format, $index + 1);
                
                if (!$parsedData['success']) {
                    $errors[] = $parsedData['error'];
                    $failedCount++;
                    $failedAccounts[] = [
                        'line' => $index + 1,
                        'content' => $line,
                        'error' => $parsedData['error']
                    ];
                    continue;
                }

                $accountInfo = $parsedData['data'];

                // Kiểm tra tài khoản đã tồn tại chưa
                $existingAccount = TiktokAccount::where('username', $accountInfo['username'])
                    ->orWhere('email', $accountInfo['email'])
                    ->first();

                if ($existingAccount) {
                    $error = "Tài khoản {$accountInfo['username']} đã tồn tại";
                    $errors[] = "Dòng " . ($index + 1) . ": " . $error;
                    $failedCount++;
                    $failedAccounts[] = [
                        'line' => $index + 1,
                        'content' => $line,
                        'error' => $error
                    ];
                    continue;
                }

                // Tạo tài khoản mới
                $accountData = [
                    'user_id' => $data['user_id'] ?? auth()->id(),
                    'username' => $accountInfo['username'],
                    'email' => $accountInfo['email'],
                    'password' => $accountInfo['password'],
                    'phone_number' => $accountInfo['phone_number'] ?? null,
                    'status' => $data['enableRunningStatus'] ?? true ? 'active' : 'inactive',
                    'notes' => "",
                ];

                // Thêm device và scenario nếu có (luôn gán nếu được truyền từ FE)
                if (!empty($data['deviceId'])) {
                    $accountData['device_id'] = $data['deviceId'];
                }

                if (!empty($data['scenarioId'])) {
                    $accountData['scenario_id'] = $data['scenarioId'];
                }

                // Thêm 2FA vào notes nếu có
                if (!empty($accountInfo['two_fa'])) {
                    $accountData['notes'] .= " | 2FA: {$accountInfo['two_fa']}";
                }

                // Thêm thông tin bổ sung vào notes
                if (!empty($accountInfo['additional_info'])) {
                    $accountData['notes'] .= " | Info: {$accountInfo['additional_info']}";
                }

                // Lưu trạng thái 2FA và mã dự phòng nếu có
                if (!empty($accountInfo['two_fa'])) {
                    $backupCodes = $this->parseBackupCodes($accountInfo['two_fa']);
                    if (!empty($backupCodes)) {
                        $accountData['two_factor_enabled'] = true;
                        $accountData['two_factor_backup_codes'] = $backupCodes;
                    } else {
                        // Nếu không parse được mã dự phòng vẫn bật cờ 2FA
                        $accountData['two_factor_enabled'] = true;
                    }
                }


                $createdAccount = $this->repository->create($accountData);
                $importedCount++;
                
                
                $importedAccounts[] = [
                    'id' => $createdAccount->id,
                    'username' => $createdAccount->username,
                    'email' => $createdAccount->email,
                    'status' => $createdAccount->status,
                    'device_id' => $createdAccount->device_id,
                    'scenario_id' => $createdAccount->scenario_id,
                    'line' => $index + 1
                ];

            } catch (\Exception $e) {
                $error = $e->getMessage();
                
                $errors[] = "Dòng " . ($index + 1) . ": " . $error;
                $failedCount++;
                $failedAccounts[] = [
                    'line' => $index + 1,
                    'content' => $line,
                    'error' => $error
                ];
            }
        }

        $totalProcessed = $importedCount + $failedCount;
        $message = "Đã xử lý {$totalProcessed} dòng: {$importedCount} thành công";
        if ($failedCount > 0) {
            $message .= ", {$failedCount} thất bại";
        }


        return [
            'success' => $importedCount > 0,
            'status' => $importedCount > 0
                ? ($failedCount > 0 ? 'partial' : 'success')
                : 'failed',
            'message' => $message,
            'data' => [
                'imported_count' => $importedCount,
                'failed_count' => $failedCount,
                'total_processed' => $totalProcessed,
                'imported_accounts' => $importedAccounts,
                'failed_accounts' => $failedAccounts,
                'errors' => $errors
            ]
        ];
    }

    /**
     * Parse a single account line based on format
     *
     * @param string $line
     * @param string $format
     * @param int $lineNumber
     * @return array
     */
    private function parseAccountLine($line, $format, $lineNumber)
    {
        $parts = explode('|', $line);

        if ($format === 'new') {
            // New format: UID|PASS|2FA|MAIL
            if (count($parts) < 2) {
                return [
                    'success' => false,
                    'error' => "Dòng {$lineNumber}: Format không đúng (cần ít nhất UID|PASS)"
                ];
            }

            $uid = trim($parts[0]);
            $password = trim($parts[1]);
            $twoFa = isset($parts[2]) ? trim($parts[2]) : '';
            $email = isset($parts[3]) ? trim($parts[3]) : '';

            // Validate UID
            if (empty($uid) || strlen($uid) < 3) {
                return [
                    'success' => false,
                    'error' => "Dòng {$lineNumber}: UID phải có ít nhất 3 ký tự"
                ];
            }

            // Validate password
            if (empty($password) || strlen($password) < 6) {
                return [
                    'success' => false,
                    'error' => "Dòng {$lineNumber}: Password phải có ít nhất 6 ký tự"
                ];
            }

            // Generate email if not provided
            if (empty($email)) {
                $email = $uid . '@tiktok.com';
            } else {
                // Validate email format
                if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
                    return [
                        'success' => false,
                        'error' => "Dòng {$lineNumber}: Email không hợp lệ"
                    ];
                }
            }

            return [
                'success' => true,
                'data' => [
                    'username' => $uid,
                    'password' => $password,
                    'two_fa' => $twoFa,
                    'email' => $email,
                    'phone_number' => null,
                    'additional_info' => null
                ]
            ];

        } else {
            // Legacy format: username|email|password|phone_number (phone_number optional)
            if (count($parts) < 3) {
                return [
                    'success' => false,
                    'error' => "Dòng {$lineNumber}: Format không đúng (cần username|email|password|phone_number)"
                ];
            }

            $username = trim($parts[0]);
            $email = trim($parts[1]);
            $password = trim($parts[2]);
            $phoneNumber = isset($parts[3]) ? trim($parts[3]) : null;

            // Validate username
            if (empty($username) || strlen($username) < 3) {
                return [
                    'success' => false,
                    'error' => "Dòng {$lineNumber}: Username phải có ít nhất 3 ký tự"
                ];
            }

            // Validate email
            if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
                return [
                    'success' => false,
                    'error' => "Dòng {$lineNumber}: Email không hợp lệ"
                ];
            }

            // Validate password
            if (empty($password) || strlen($password) < 6) {
                return [
                    'success' => false,
                    'error' => "Dòng {$lineNumber}: Password phải có ít nhất 6 ký tự"
                ];
            }

            return [
                'success' => true,
                'data' => [
                    'username' => $username,
                    'email' => $email,
                    'password' => $password,
                    'phone_number' => $phoneNumber,
                    'two_fa' => null,
                    'additional_info' => null
                ]
            ];
        }
    }

    /**
     * Parse backup codes helper
     */
    private function parseBackupCodes($input)
    {
        if (is_array($input)) {
            return array_values(array_filter(array_map('strval', $input)));
        }
        $str = trim((string) $input);
        if ($str === '') {
            return [];
        }
        // JSON array input
        if ($str[0] === '[') {
            $decoded = json_decode($str, true);
            if (is_array($decoded)) {
                return array_values(array_filter(array_map('strval', $decoded)));
            }
        }
        // Normalize common separators to commas, then split
        $normalized = preg_replace('/[\s;|]+/', ',', $str);
        $parts = array_filter(array_map('trim', explode(',', $normalized)));
        return array_values($parts);
    }

    /**
     * Get TikTok account statistics
     *
     * @param \App\Models\User $user
     * @return array
     */
    public function getStatistics($user)
    {
        $query = TiktokAccount::query();
        
        // Nếu không phải admin, chỉ lấy tài khoản của user hiện tại
        if (!$user->hasRole('admin')) {
            $query->where('user_id', $user->id);
        }

        // Lấy thống kê hiện tại
        $totalAccounts = $query->count();
        $activeAccounts = (clone $query)->where('status', 'active')->count();
        $inactiveAccounts = (clone $query)->where('status', 'inactive')->count();
        $suspendedAccounts = (clone $query)->where('status', 'suspended')->count();

        // Tính toán running tasks (giả sử có bảng account_tasks hoặc tương tự)
        // Tạm thời sử dụng active accounts làm running tasks
        $runningTasks = $activeAccounts;

        // Lấy thống kê tháng trước để tính % thay đổi
        $lastMonth = now()->subMonth();
        $lastMonthQuery = TiktokAccount::query()
            ->where('created_at', '<=', $lastMonth->endOfMonth());
            
        if (!$user->hasRole('admin')) {
            $lastMonthQuery->where('user_id', $user->id);
        }

        $lastMonthTotal = $lastMonthQuery->count();
        $lastMonthActive = (clone $lastMonthQuery)->where('status', 'active')->count();
        $lastMonthInactive = (clone $lastMonthQuery)->where('status', 'inactive')->count();
        $lastMonthRunning = $lastMonthActive; // Tạm thời

        // Tính % thay đổi
        $totalChange = $this->calculatePercentageChange($lastMonthTotal, $totalAccounts);
        $activeChange = $this->calculatePercentageChange($lastMonthActive, $activeAccounts);
        $inactiveChange = $this->calculatePercentageChange($lastMonthInactive, $inactiveAccounts);
        $runningChange = $this->calculatePercentageChange($lastMonthRunning, $runningTasks);

        return [
            'totalAccounts' => $totalAccounts,
            'activeAccounts' => $activeAccounts,
            'inactiveAccounts' => $inactiveAccounts,
            'suspendedAccounts' => $suspendedAccounts,
            'runningTasks' => $runningTasks,
            
            // Change data
            'totalAccountsChange' => $totalChange['percentage'],
            'totalAccountsChangeType' => $totalChange['type'],
            'activeAccountsChange' => $activeChange['percentage'],
            'activeAccountsChangeType' => $activeChange['type'],
            'inactiveAccountsChange' => $inactiveChange['percentage'],
            'inactiveAccountsChangeType' => $inactiveChange['type'],
            'runningTasksChange' => $runningChange['percentage'],
            'runningTasksChangeType' => $runningChange['type'],
        ];
    }

    /**
     * Calculate percentage change between two values
     *
     * @param int $oldValue
     * @param int $newValue
     * @return array
     */
    private function calculatePercentageChange($oldValue, $newValue)
    {
        if ($oldValue == 0) {
            if ($newValue > 0) {
                return ['percentage' => '+100%', 'type' => 'increase'];
            }
            return ['percentage' => null, 'type' => 'neutral'];
        }

        $change = (($newValue - $oldValue) / $oldValue) * 100;
        $changeRounded = round($change);

        if ($changeRounded > 0) {
            return ['percentage' => "+{$changeRounded}%", 'type' => 'increase'];
        } elseif ($changeRounded < 0) {
            return ['percentage' => "{$changeRounded}%", 'type' => 'decrease'];
        } else {
            return ['percentage' => "0%", 'type' => 'neutral'];
        }
    }

    /**
     * Get recent activities for user's TikTok accounts
     *
     * @param \App\Models\User $user
     * @return array
     */
    public function getRecentActivities($user)
    {
        // Get user's TikTok account IDs
        $accountIds = TiktokAccount::where('user_id', $user->id)->pluck('id');

        // Get recent account tasks
        $recentTasks = AccountTask::with(['tiktokAccount', 'interactionScenario'])
            ->whereIn('tiktok_account_id', $accountIds)
            ->orderBy('updated_at', 'desc')
            ->limit(10)
            ->get();

        $activities = [];
        
        foreach ($recentTasks as $task) {
            $timeAgo = $this->getTimeAgo($task->updated_at);
            $action = $this->getActionDescription($task);
            $status = $this->getStatusType($task->status);

            $activities[] = [
                'id' => $task->id,
                'username' => '@' . ($task->tiktokAccount->username ?? 'unknown'),
                'action' => $action,
                'status' => $status,
                'time' => $timeAgo,
                'scenario_name' => $task->interactionScenario->name ?? null,
                'task_type' => $task->task_type,
                'task_status' => $task->status
            ];
        }

        return $activities;
    }

    /**
     * Add task analysis information to TikTok account
     *
     * @param TiktokAccount $account
     * @return TiktokAccount
     */
    private function addTaskAnalysis($account)
    {
        // Chỉ xử lý pending tasks
        $pendingTasks = $account->pendingTasks ?? collect();
        $pendingTasksCount = $account->pending_tasks_count ?? 0;

        // Thông tin tổng quan về pending tasks
        $taskSummary = [
            'pending_tasks_count' => $pendingTasksCount,
            'has_pending_tasks' => $pendingTasksCount > 0,
        ];

        // Trạng thái hiện tại của account
        $currentStatus = $pendingTasksCount > 0 ? 'has_pending_tasks' : 'no_pending_tasks';

        // Thông tin scenario của account (1 account = 1 scenario)
        $accountScenario = null;
        if ($account->interactionScenario) {
            $accountScenario = [
                'id' => $account->interactionScenario->id,
                'name' => $account->interactionScenario->name,
                'description' => $account->interactionScenario->description ?? null,
            ];
        }

        // Thông tin chi tiết về pending tasks
        $pendingTasksInfo = [];
        $linkedDevices = [];
        
        foreach ($pendingTasks as $task) {
            $pendingTasksInfo[] = [
                'id' => $task->id,
                'task_type' => $task->task_type,
                'priority' => $task->priority,
                'created_at' => $task->created_at,
                'scheduled_at' => $task->scheduled_at,
                'parameters' => $task->parameters,
                'retry_count' => $task->retry_count,
                'max_retries' => $task->max_retries,
                'device' => $task->device ? [
                    'id' => $task->device->id,
                    'name' => $task->device->name,
                    'device_id' => $task->device->device_id ?? null,
                    'status' => $task->device->status ?? null,
                ] : null,
            ];

            // Thu thập thông tin devices liên kết
            if ($task->device && !in_array($task->device->id, array_column($linkedDevices, 'id'))) {
                $linkedDevices[] = [
                    'id' => $task->device->id,
                    'name' => $task->device->name,
                    'device_id' => $task->device->device_id ?? null,
                    'status' => $task->device->status ?? null,
                ];
            }
        }

        // Thêm thông tin phân tích vào account
        $account->task_analysis = [
            'summary' => $taskSummary,
            'current_status' => $currentStatus,
            'account_scenario' => $accountScenario, // Scenario của account
            'pending_tasks' => $pendingTasksInfo,
            'linked_devices' => $linkedDevices,
            'next_task' => $pendingTasksInfo[0] ?? null, // Task có priority cao nhất
        ];

        return $account;
    }

    /**
     * Determine account task status based on current tasks
     *
     * @param TiktokAccount $account
     * @return string
     */
    private function determineAccountTaskStatus($account)
    {
        if ($account->running_tasks_count > 0) {
            return 'running';
        }
        
        if ($account->pending_tasks_count > 0) {
            return 'pending';
        }
        
        if ($account->total_tasks_count == 0) {
            return 'no_tasks';
        }
        
        // Kiểm tra task gần nhất
        $latestTask = $account->accountTasks->first();
        if ($latestTask) {
            switch ($latestTask->status) {
                case 'completed':
                    return 'idle_completed';
                case 'failed':
                    return 'idle_failed';
                case 'cancelled':
                    return 'idle_cancelled';
                default:
                    return 'idle';
            }
        }
        
        return 'idle';
    }

    /**
     * Get human readable action description
     *
     * @param AccountTask $task
     * @return string
     */
    private function getActionDescription($task)
    {
        $scenarioName = $task->interactionScenario->name ?? 'Kịch bản';
        
        switch ($task->status) {
            case 'pending':
                return "Chờ thực hiện {$scenarioName}";
            case 'running':
                return "Đang thực hiện {$scenarioName}";
            case 'completed':
                return "Hoàn thành {$scenarioName}";
            case 'failed':
                return "Lỗi khi thực hiện {$scenarioName}";
            case 'cancelled':
                return "Đã hủy {$scenarioName}";
            default:
                return "Thực hiện {$scenarioName}";
        }
    }

    /**
     * Get status type for UI
     *
     * @param string $status
     * @return string
     */
    private function getStatusType($status)
    {
        switch ($status) {
            case 'completed':
                return 'success';
            case 'failed':
                return 'error';
            case 'running':
                return 'running';
            case 'pending':
                return 'pending';
            case 'cancelled':
                return 'cancelled';
            default:
                return 'unknown';
        }
    }

    /**
     * Get time ago string
     *
     * @param Carbon $datetime
     * @return string
     */
    private function getTimeAgo($datetime)
    {
        $now = Carbon::now();
        $diff = $datetime->diffInMinutes($now);

        if ($diff < 1) {
            return 'Vừa xong';
        } elseif ($diff < 60) {
            return $diff . ' phút trước';
        } elseif ($diff < 1440) { // 24 hours
            $hours = floor($diff / 60);
            return $hours . ' giờ trước';
        } else {
            $days = floor($diff / 1440);
            return $days . ' ngày trước';
        }
    }

    /**
     * Get comprehensive task analysis for user's TikTok accounts
     *
     * @param \App\Models\User $user
     * @return array
     */
    public function getTaskAnalysis($user)
    {
        $accountQuery = TiktokAccount::query();
        
        // Nếu không phải admin, chỉ lấy tài khoản của user hiện tại
        if (!$user->hasRole('admin')) {
            $accountQuery->where('user_id', $user->id);
        }

        $accountIds = $accountQuery->pluck('id');
        
        // Task overview - thống kê accounts theo trạng thái task
        $totalAccounts = $accountQuery->count();
        
        $accountsWithPendingTasks = $accountQuery->whereHas('accountTasks', function($q) {
            $q->where('status', 'pending');
        })->count();
        
        $accountsWithRunningTasks = $accountQuery->whereHas('accountTasks', function($q) {
            $q->where('status', 'running');
        })->count();
        
        $accountsWithNoTasks = $accountQuery->whereDoesntHave('accountTasks')->count();
        
        $idleAccounts = $accountQuery->whereHas('accountTasks')
            ->whereDoesntHave('accountTasks', function($q) {
                $q->whereIn('status', ['running', 'pending']);
            })->count();

        // Task statistics - thống kê chi tiết về tasks
        $taskQuery = AccountTask::whereIn('tiktok_account_id', $accountIds);
        
        $totalPendingTasks = (clone $taskQuery)->where('status', 'pending')->count();
        $totalRunningTasks = (clone $taskQuery)->where('status', 'running')->count();
        $totalCompletedTasks = (clone $taskQuery)->where('status', 'completed')->count();
        $totalFailedTasks = (clone $taskQuery)->where('status', 'failed')->count();
        
        $totalFinishedTasks = $totalCompletedTasks + $totalFailedTasks;
        $averageSuccessRate = $totalFinishedTasks > 0 
            ? round(($totalCompletedTasks / $totalFinishedTasks) * 100, 1)
            : 0;

        // Task distribution - phân bố theo loại task
        $taskDistribution = (clone $taskQuery)
            ->selectRaw('task_type, COUNT(*) as count')
            ->groupBy('task_type')
            ->orderByDesc('count')
            ->get()
            ->map(function($item) use ($taskQuery) {
                $totalTasks = $taskQuery->count();
                $percentage = $totalTasks > 0 ? round(($item->count / $totalTasks) * 100, 1) : 0;
                
                return [
                    'task_type' => $item->task_type,
                    'count' => $item->count,
                    'percentage' => $percentage
                ];
            });

        // Priority distribution - phân bố theo độ ưu tiên
        $priorityDistribution = (clone $taskQuery)
            ->selectRaw('priority, COUNT(*) as count')
            ->groupBy('priority')
            ->get()
            ->map(function($item) use ($taskQuery) {
                $totalTasks = $taskQuery->count();
                $percentage = $totalTasks > 0 ? round(($item->count / $totalTasks) * 100, 1) : 0;
                
                return [
                    'priority' => $item->priority,
                    'count' => $item->count,
                    'percentage' => $percentage
                ];
            });

        // Recent task trends - xu hướng task trong 7 ngày qua
        $recentTrends = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = now()->subDays($i);
            $dayTasks = (clone $taskQuery)
                ->whereDate('created_at', $date->toDateString())
                ->count();
                
            $recentTrends[] = [
                'date' => $date->format('Y-m-d'),
                'day_name' => $date->format('l'),
                'task_count' => $dayTasks
            ];
        }

        return [
            'task_overview' => [
                'total_accounts' => $totalAccounts,
                'accounts_with_pending_tasks' => $accountsWithPendingTasks,
                'accounts_with_running_tasks' => $accountsWithRunningTasks,
                'accounts_with_no_tasks' => $accountsWithNoTasks,
                'idle_accounts' => $idleAccounts,
                'active_accounts' => $accountsWithPendingTasks + $accountsWithRunningTasks,
            ],
            'task_statistics' => [
                'total_pending_tasks' => $totalPendingTasks,
                'total_running_tasks' => $totalRunningTasks,
                'total_completed_tasks' => $totalCompletedTasks,
                'total_failed_tasks' => $totalFailedTasks,
                'total_tasks' => $taskQuery->count(),
                'average_success_rate' => $averageSuccessRate,
            ],
            'task_distribution' => $taskDistribution,
            'priority_distribution' => $priorityDistribution,
            'recent_trends' => $recentTrends,
        ];
    }
}

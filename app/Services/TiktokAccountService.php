<?php

namespace App\Services;

use App\Models\TiktokAccount;
use App\Models\AccountTask;
use App\Queries\BaseQuery;
use App\Repositories\TiktokAccountRepositoryInterface;
use Illuminate\Http\Request;
use Carbon\Carbon;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use App\Events\StopTaskOnDevice;
use App\Models\Device;

class TiktokAccountService
{
    protected $repository;
    protected $accountTaskService;

    public function __construct(TiktokAccountRepositoryInterface $repository, AccountTaskService $accountTaskService)
    {
        $this->repository = $repository;
        $this->accountTaskService = $accountTaskService;
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
            'proxy:id,name,host,port,type,status,country,city', // Proxy của account
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

        // Filter theo proxy_status
        if ($request->has('filter.proxy_status')) {
            $proxyStatus = $request->input('filter.proxy_status');
            
            switch ($proxyStatus) {
                case 'has_proxy':
                    $query->whereHas('proxy');
                    break;
                    
                case 'no_proxy':
                    $query->whereDoesntHave('proxy');
                    break;
                    
                case 'active_proxy':
                    $query->whereHas('proxy', function($q) {
                        $q->where('status', 'active');
                    });
                    break;
                    
                case 'error_proxy':
                    $query->whereHas('proxy', function($q) {
                        $q->where('status', 'error');
                    });
                    break;
                    
                case 'inactive_proxy':
                    $query->whereHas('proxy', function($q) {
                        $q->where('status', 'inactive');
                    });
                    break;
            }
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
     * Get account details with relations and computed fields
     */
    public function getAccountDetails(TiktokAccount $tiktokAccount, $user): array
    {
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
            'interactionScenario:id,name',
            'proxy:id,name,host,port,type,status,country,city'
        ]);

        $accountData = $tiktokAccount->toArray();
        // Remove old proxy fields and use proxy relationship data
        $accountData['task_statistics'] = [
            'pending_tasks_count' => $tiktokAccount->pendingTasks->count(),
            'running_tasks_count' => $tiktokAccount->runningTasks->count(),
            'total_tasks_count' => $tiktokAccount->accountTasks()->count(),
            'completed_tasks_count' => $tiktokAccount->accountTasks()->where('status', 'completed')->count(),
            'failed_tasks_count' => $tiktokAccount->accountTasks()->where('status', 'failed')->count(),
        ];
        $accountData['join_date'] = $tiktokAccount->created_at->format('d/m/Y');
        $accountData['last_activity'] = $tiktokAccount->last_activity_at ?
            $tiktokAccount->last_activity_at->diffForHumans() : 'Chưa có hoạt động';
        $accountData['display_name'] = $tiktokAccount->nickname ?: $tiktokAccount->username;
        $accountData['estimated_views'] = $tiktokAccount->video_count * 1000;

        return $accountData;
    }

    /**
     * Get activity history with filters and pagination for a TikTok account
     */
    public function getActivityHistory(TiktokAccount $tiktokAccount, array $filters): array
    {
        $perPage = $filters['per_page'] ?? 20;
        $page = $filters['page'] ?? 1;

        $query = $tiktokAccount->accountTasks()
            ->select([
                'id', 'task_type', 'status', 'priority', 'completed_at',
                'started_at', 'scheduled_at', 'created_at', 'error_message'
            ]);

        if (isset($filters['status'])) {
            $query->where('status', $filters['status']);
        }
        if (isset($filters['task_type'])) {
            $query->where('task_type', $filters['task_type']);
        }
        if (isset($filters['priority'])) {
            $query->where('priority', $filters['priority']);
        }

        $query->orderByRaw("
            CASE 
                WHEN completed_at IS NOT NULL THEN completed_at
                WHEN started_at IS NOT NULL THEN started_at
                WHEN scheduled_at IS NOT NULL THEN scheduled_at
                ELSE created_at
            END DESC
        ");

        $activities = $query->paginate($perPage, ['*'], 'page', $page);

        return [
            'activities' => $activities->items(),
            'pagination' => [
                'current_page' => $activities->currentPage(),
                'per_page' => $activities->perPage(),
                'total' => $activities->total(),
                'last_page' => $activities->lastPage(),
                'from' => $activities->firstItem(),
                'to' => $activities->lastItem(),
            ]
        ];
    }

    /**
     * Run linked scenario: create tasks from scenario for account
     */
    public function runScenarioForAccount(TiktokAccount $account, ?int $deviceId, int $userId): array
    {
        return $this->accountTaskService->createTasksFromScenario($account, $deviceId, $userId);
    }

    /**
     * Enable 2FA with optional backup codes
     */
    public function enableTwoFactor(TiktokAccount $account, ?array $backupCodes = null): TiktokAccount
    {
        $codes = $backupCodes ?? $this->generateBackupCodes();
        return $this->updateTiktokAccount($account, [
            'two_factor_enabled' => true,
            'two_factor_backup_codes' => $codes,
        ]);
    }

    /**
     * Disable 2FA
     */
    public function disableTwoFactor(TiktokAccount $account): TiktokAccount
    {
        return $this->updateTiktokAccount($account, [
            'two_factor_enabled' => false,
            'two_factor_backup_codes' => null,
        ]);
    }

    /**
     * Regenerate 2FA backup codes
     */
    public function regenerateBackupCodes(TiktokAccount $account): TiktokAccount
    {
        $codes = $this->generateBackupCodes();
        return $this->updateTiktokAccount($account, [
            'two_factor_backup_codes' => $codes,
        ]);
    }

    /**
     * Delete all pending tasks for specified accounts of the user
     */
    public function deletePendingTasksForUser($user, array $accountIds): array
    {
        // Get accounts that belong to the user with their devices
        $accounts = TiktokAccount::where('user_id', $user->id)
            ->whereIn('id', $accountIds)
            ->with('device')
            ->get();

        if ($accounts->isEmpty()) {
            return [
                'success' => false,
                'message' => 'Không tìm thấy tài khoản nào thuộc về bạn'
            ];
        }

        $deletedCount = 0;
        $devicesNotified = [];

        foreach ($accounts as $account) {
            $deleted = $account->accountTasks()
                ->where('status', 'pending')
                ->delete();

            $deletedCount += $deleted;

            if ($deleted > 0 && $account->device && !in_array($account->device->id, $devicesNotified)) {
                event(new StopTaskOnDevice($account->device));
                $devicesNotified[] = $account->device->id;
                Log::info("Fired StopTaskOnDevice event for device: {$account->device->device_id}");
            }
        }

        return [
            'success' => true,
            'message' => "Đã xóa {$deletedCount} pending tasks thành công",
            'data' => [
                'deleted_count' => $deletedCount,
                'processed_accounts' => $accounts->count(),
                'devices_notified' => count($devicesNotified)
            ]
        ];
    }

    /**
     * Upload file for account and return file info
     */
    public function uploadFileForAccount(TiktokAccount $account, UploadedFile $file, string $type, string $description, int $userId): array
    {
        $directory = "tiktok-accounts/{$account->id}/{$type}";
        $filename = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
        $path = $file->storeAs($directory, $filename, 'public');

        return [
            'tiktok_account_id' => $account->id,
            'user_id' => $userId,
            'filename' => $filename,
            'original_name' => $file->getClientOriginalName(),
            'path' => $path,
            'type' => $type,
            'mime_type' => $file->getMimeType(),
            'size' => $file->getSize(),
            'description' => $description,
            'file_url' => asset('storage/' . $path),
        ];
    }

    /**
     * Create a post task for account
     */
    public function createPostForAccount(TiktokAccount $account, array $validated, int $userId): array
    {
        // Block if device has running task
        if ($account->device_id && $this->hasRunningTaskOnDevice($account->device_id)) {
            return [
                'success' => false,
                'message' => 'Thiết bị đang có task chạy, không tạo thêm task mới.'
            ];
        }

        $uploadedFiles = [];
        if (isset($validated['files']) && is_array($validated['files'])) {
            foreach ($validated['files'] as $file) {
                $directory = "tiktok-accounts/{$account->id}/post_content";
                $filename = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
                $path = $file->storeAs($directory, $filename, 'public');

                $uploadedFiles[] = [
                    'filename' => $filename,
                    'original_name' => $file->getClientOriginalName(),
                    'path' => $path,
                    'url' => asset('storage/' . $path),
                    'size' => $file->getSize(),
                    'mime_type' => $file->getMimeType(),
                ];
            }
        }

        $postData = [
            'tiktok_account_id' => $account->id,
            'user_id' => $userId,
            'title' => $validated['title'] ?? '',
            'content' => $validated['content'] ?? '',
            'files' => $uploadedFiles,
            'settings' => $validated['settings'] ?? [],
            'scheduled_at' => $validated['scheduled_at'] ?? null,
            'auto_cut' => $validated['auto_cut'] ?? false,
            'filter_type' => $validated['filter_type'] ?? 'random',
            'custom_filters' => $validated['custom_filters'] ?? [],
            'add_trending_music' => $validated['add_trending_music'] ?? false,
            'enable_tiktok_shop' => $validated['enable_tiktok_shop'] ?? false,
            'status' => 'pending',
        ];

        $taskData = [
            'tiktok_account_id' => $account->id,
            'task_type' => 'create_post',
            'status' => 'pending',
            'priority' => 'medium',
            'parameters' => $postData,
            'scheduled_at' => $validated['scheduled_at'] ?? now(),
            'device_id' => $account->device_id,
        ];

        $task = $this->accountTaskService->create($taskData);

        return [
            'success' => true,
            'message' => 'Post created successfully and queued for publishing',
            'data' => [
                'post_id' => $task->id,
                'task_id' => $task->id,
                'status' => 'pending',
                'scheduled_at' => $task->scheduled_at,
                'files' => $uploadedFiles,
            ]
        ];
    }

    /**
     * Update avatar for account and create task
     */
    public function updateAvatarForAccount(TiktokAccount $account, UploadedFile $file, string $description, int $userId): array
    {
        if ($account->device_id && $this->hasRunningTaskOnDevice($account->device_id)) {
            return [
                'success' => false,
                'message' => 'Thiết bị đang có task chạy, không tạo thêm task mới.'
            ];
        }

        $directory = "tiktok-accounts/{$account->id}/avatars";

        if ($account->avatar_url) {
            $oldPath = str_replace(asset('storage/'), '', $account->avatar_url);
            Storage::disk('public')->delete($oldPath);
        }

        $filename = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
        $path = $file->storeAs($directory, $filename, 'public');

        $updatedAccount = $this->updateTiktokAccount($account, [
            'avatar_url' => asset('storage/' . $path),
        ]);

        $taskData = [
            'tiktok_account_id' => $account->id,
            'task_type' => 'update_avatar',
            'status' => 'pending',
            'priority' => 'medium',
            'parameters' => [
                'avatar_url' => asset('storage/' . $path),
                'description' => $description,
            ],
            'scheduled_at' => now(),
            'device_id' => $account->device_id,
        ];

        $task = $this->accountTaskService->create($taskData);

        return [
            'success' => true,
            'message' => 'Avatar updated successfully and queued for TikTok update',
            'data' => [
                'avatar_url' => asset('storage/' . $path),
                'task_id' => $task->id,
                'status' => 'pending',
            ]
        ];
    }

    /**
     * Helper: check if a device currently has running task
     */
    private function hasRunningTaskOnDevice(int $deviceId): bool
    {
        return AccountTask::where('device_id', $deviceId)
            ->where('status', 'running')
            ->exists();
    }

    /**
     * Generate backup codes for 2FA
     */
    private function generateBackupCodes(): array
    {
        $codes = [];
        for ($i = 0; $i < 8; $i++) {
            $codes[] = strtoupper(substr(str_shuffle('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'), 0, 8));
        }
        return $codes;
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

                // Thêm proxy nếu có
                if (!empty($data['proxyId'])) {
                    $accountData['proxy_id'] = $data['proxyId'];
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

        $query = AccountTask::with(['tiktokAccount:id,username'])
            ->whereIn('tiktok_account_id', $accountIds)
            ->select(['id','tiktok_account_id','task_type','status','priority','completed_at','started_at','scheduled_at','created_at','error_message'])
            ->orderByRaw("\n            CASE \n                WHEN completed_at IS NOT NULL THEN completed_at\n                WHEN started_at IS NOT NULL THEN started_at\n                WHEN scheduled_at IS NOT NULL THEN scheduled_at\n                ELSE created_at\n            END DESC\n        ")
            ->limit(20)
            ->get();

        return $query->filter(function ($task) {
                return $task->tiktokAccount !== null;
            })
            ->map(function ($task) {
                $time = $task->completed_at ?? $task->started_at ?? $task->scheduled_at ?? $task->created_at;
                return [
                    'id' => $task->id,
                    'username' => '@' . $task->tiktokAccount->username,
                    'action' => $this->getActionDescription($task),
                    'status' => $task->status,
                    'time' => $this->getTimeAgo($time),
                    'scenario_name' => $task->interactionScenario->name ?? null,
                    'priority' => $task->priority,
                    'error_message' => $task->error_message,
                ];
            })
            ->values()
            ->toArray();
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

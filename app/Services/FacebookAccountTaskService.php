<?php

namespace App\Services;

use App\Models\FacebookAccount;
use App\Models\AccountTask;
use App\Models\InteractionScenario;
use App\Models\Device;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class FacebookAccountTaskService
{
    /**
     * Chạy scenario cho một Facebook account
     */
    public function runScenario(FacebookAccount $account): array
    {
        try {
            // Kiểm tra account có scenario không
            if (!$account->interactionScenario) {
                return [
                    'success' => false,
                    'message' => 'Account chưa được gán kịch bản tương tác'
                ];
            }

            // Kiểm tra account có device không
            if (!$account->device) {
                return [
                    'success' => false,
                    'message' => 'Account chưa được gán thiết bị'
                ];
            }

            // Kiểm tra account có đang chạy task nào không
            $runningTasks = $account->runningTasks()->count();
            if ($runningTasks > 0) {
                return [
                    'success' => false,
                    'message' => 'Account đang có task đang chạy'
                ];
            }

            // Xóa các pending tasks cũ
            $account->pendingTasks()->delete();

            // Tạo tasks từ scenario
            $tasks = $this->createTasksFromScenario($account);

            if (empty($tasks)) {
                return [
                    'success' => false,
                    'message' => 'Không thể tạo tasks từ scenario'
                ];
            }

            // Dispatch tasks đến device
            $this->dispatchTasksToDevice($account, $tasks);

            return [
                'success' => true,
                'message' => "Đã tạo {$tasks->count()} tasks cho account {$account->username}",
                'data' => [
                    'tasks_count' => $tasks->count(),
                    'device_id' => $account->device_id,
                ]
            ];

        } catch (\Exception $e) {
            Log::error('Facebook Account Task Service Error', [
                'account_id' => $account->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return [
                'success' => false,
                'message' => 'Lỗi hệ thống: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Tạo tasks từ scenario
     */
    protected function createTasksFromScenario(FacebookAccount $account)
    {
        $scenario = $account->interactionScenario;
        $tasks = collect();

        // Lấy danh sách scripts từ scenario
        $scripts = $scenario->scenarioScripts()->orderBy('order')->get();

        foreach ($scripts as $script) {
            $task = AccountTask::create([
                'facebook_account_id' => $account->id,
                'interaction_scenario_id' => $scenario->id,
                'device_id' => $account->device_id,
                'task_type' => $script->script_type,
                'parameters' => $script->parameters,
                'priority' => $script->priority ?? 'medium',
                'status' => 'pending',
                'max_retries' => $script->max_retries ?? 3,
                'scheduled_at' => now()->addMinutes($script->delay_minutes ?? 0),
            ]);

            $tasks->push($task);
        }

        return $tasks;
    }

    /**
     * Dispatch tasks đến device
     */
    protected function dispatchTasksToDevice(FacebookAccount $account, $tasks)
    {
        $device = $account->device;

        // Gửi thông báo đến device để bắt đầu tasks
        // TODO: Implement device notification system
        Log::info('Dispatching Facebook tasks to device', [
            'account_id' => $account->id,
            'device_id' => $device->id,
            'tasks_count' => $tasks->count()
        ]);
    }

    /**
     * Dừng tất cả tasks của account
     */
    public function stopAllTasks(FacebookAccount $account): array
    {
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

            return [
                'success' => true,
                'message' => "Đã dừng {$pendingCount} pending tasks và {$runningCount} running tasks",
                'data' => [
                    'cancelled_pending' => $pendingCount,
                    'cancelled_running' => $runningCount
                ]
            ];

        } catch (\Exception $e) {
            Log::error('Stop Facebook Account Tasks Error', [
                'account_id' => $account->id,
                'error' => $e->getMessage()
            ]);

            return [
                'success' => false,
                'message' => 'Lỗi khi dừng tasks: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Bulk run scenario cho nhiều accounts
     */
    public function bulkRunScenario(array $accountIds): array
    {
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

            $result = $this->runScenario($account);
            $result['account_id'] = $accountId;
            $result['username'] = $account->username;

            $results[] = $result;

            if ($result['success']) {
                $successCount++;
            } else {
                $errorCount++;
            }
        }

        return [
            'success' => $successCount > 0,
            'message' => "Đã xử lý {$successCount} thành công, {$errorCount} thất bại",
            'data' => [
                'total' => count($accountIds),
                'success' => $successCount,
                'error' => $errorCount,
                'results' => $results
            ]
        ];
    }

    /**
     * Bulk stop tasks cho nhiều accounts
     */
    public function bulkStopTasks(array $accountIds): array
    {
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

            $result = $this->stopAllTasks($account);
            $result['account_id'] = $accountId;
            $result['username'] = $account->username;

            $results[] = $result;

            if ($result['success']) {
                $successCount++;
            } else {
                $errorCount++;
            }
        }

        return [
            'success' => $successCount > 0,
            'message' => "Đã dừng tasks cho {$successCount} accounts thành công, {$errorCount} thất bại",
            'data' => [
                'total' => count($accountIds),
                'success' => $successCount,
                'error' => $errorCount,
                'results' => $results
            ]
        ];
    }
}

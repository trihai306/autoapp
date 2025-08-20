<?php

namespace App\Http\Controllers\Api\Devices;

use App\Events\TiktokAccountTableReload;
use App\Http\Controllers\Controller;
use App\Models\AccountTask;
use App\Models\Device;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AccountTaskController extends Controller
{
    /**
     * Trả về danh sách task đang chờ cho một thiết bị.
     */
    public function pendingForDevice(Request $request,$device): JsonResponse
    {
        // chỉ lấy task pending + scheduled (scheduled_at null hoặc <= now)
        $device = Device::where('device_id', $device)->first();
        $tasks = AccountTask::where('device_id', $device->id)
            ->pending()
            ->scheduled()
            ->with(['tiktokAccount.proxy'])
            ->orderBy('priority', 'desc')
            ->orderBy('id')
            ->get();

        return response()->json([
            'success' => true,
            'tasks'   => $tasks,
            'count'   => $tasks->count(),
        ]);
    }

    /**
     * Cập nhật trạng thái task
     * body: { status: running|completed|failed, result?: array, error_message?: string }
     */
    public function updateStatus(Request $request, AccountTask $task): JsonResponse
    {
        $data = $request->validate([
            'status'        => ['required', Rule::in(['running', 'completed', 'failed'])],
            'result'        => 'nullable|array',
            'error_message' => 'nullable|string',
        ]);

        $originalStatus = $task->status;

        switch ($data['status']) {
            case 'running':
                $task->start();
                break;
            case 'completed':
                $task->complete($data['result'] ?? null);
                break;
            case 'failed':
                $task->fail($data['error_message'] ?? '');
                break;
        }

        // Chỉ broadcast khi task chuyển sang trạng thái kết thúc (completed/failed)
        if ($originalStatus !== 'completed' && $originalStatus !== 'failed' && in_array($task->status, ['completed', 'failed'])) {
            $task->load('tiktokAccount.user'); // Eager load the user through the account
            if ($task->tiktokAccount && $task->tiktokAccount->user) {
                $userId = $task->tiktokAccount->user->id;
                $message = "Tác vụ cho tài khoản {$task->tiktokAccount->username} đã {$task->status}.";
                $type = $task->status === 'completed' ? 'success' : 'error';

                // Gửi sự kiện để làm mới bảng tài khoản TikTok
                event(new TiktokAccountTableReload($message, $userId));
            }
        }

        return response()->json([
            'success' => true,
            'task'    => $task->fresh(),
        ]);
    }
} 
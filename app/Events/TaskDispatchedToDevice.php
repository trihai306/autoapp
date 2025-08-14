<?php

namespace App\Events;

use App\Models\AccountTask;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class TaskDispatchedToDevice implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * @var \App\Models\AccountTask
     */
    public AccountTask $task;

    /**
     * Khóa kênh broadcast (device_id - chuỗi)
     */
    public string $deviceKey;

    /**
     * Tạo một instance mới của sự kiện.
     */
    public function __construct(AccountTask $task)
    {
        $this->task = $task;
        // Lấy device tương ứng – ưu tiên quan hệ đã nạp
        $deviceModel = $task->relationLoaded('device') ? $task->device : \App\Models\Device::find($task->device_id);
        $this->deviceKey = $deviceModel?->device_id ?? (string) $task->device_id;
    }

    /**
     * Tên event broadcast
     */
    public function broadcastAs(): string
    {
        return 'device.task.created';
    }

    /**
     * Channel mà event sẽ broadcast tới
     */
    public function broadcastOn(): Channel
    {
        return new PrivateChannel('device.' . $this->deviceKey);
    }

    /**
     * Payload gửi đi kèm event
     */
    public function broadcastWith(): array
    {
        return [
            'task_id'             => $this->task->id,
            'tiktok_account_id'   => $this->task->tiktok_account_id,
            'interaction_scenario_id' => $this->task->interaction_scenario_id,
            'task_type'           => $this->task->task_type,
            'parameters'          => $this->task->parameters,
            'priority'            => $this->task->priority,
            'status'              => $this->task->status,
            'scheduled_at'        => $this->task->scheduled_at?->format('Y-m-d H:i:s'),
            'created_at'          => $this->task->created_at?->format('Y-m-d H:i:s'),
        ];
    }
} 
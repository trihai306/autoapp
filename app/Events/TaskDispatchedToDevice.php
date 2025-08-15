<?php

namespace App\Events;

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
     * Khóa kênh broadcast (device_id - chuỗi)
     */
    public string $deviceKey;

    /**
     * Tạo một instance mới của sự kiện.
     */
    public function __construct(string $deviceId)
    {
        $this->deviceKey = $deviceId;
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
            'message' => 'New task has been dispatched to device',
            'device_id' => $this->deviceKey,
            'timestamp' => now()->format('Y-m-d H:i:s'),
        ];
    }
} 
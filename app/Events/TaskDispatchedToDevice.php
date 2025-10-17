<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

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

        // Log khi tạo event
        Log::info('🚀 TaskDispatchedToDevice: Event created', [
            'device_id' => $deviceId,
            'device_key' => $this->deviceKey,
            'timestamp' => now()->format('Y-m-d H:i:s.u')
        ]);
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
        $channelName = 'device.' . $this->deviceKey;

        // Log channel information
        Log::info('📡 TaskDispatchedToDevice: Broadcasting to channel', [
            'device_id' => $this->deviceKey,
            'channel_name' => $channelName,
            'timestamp' => now()->format('Y-m-d H:i:s.u')
        ]);

        return new PrivateChannel($channelName);
    }

    /**
     * Payload gửi đi kèm event
     */
    public function broadcastWith(): array
    {
        $payload = [
            'message' => 'New task has been dispatched to device',
            'device_id' => $this->deviceKey,
            'timestamp' => now()->format('Y-m-d H:i:s'),
        ];

        // Log payload information
        Log::info('📦 TaskDispatchedToDevice: Broadcasting payload', [
            'device_id' => $this->deviceKey,
            'payload' => $payload,
            'timestamp' => now()->format('Y-m-d H:i:s.u')
        ]);

        return $payload;
    }
}

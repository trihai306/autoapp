<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class DeviceTableReload implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * @var string|null
     */
    public ?string $message;

    /**
     * @var int|null User ID để gửi private channel
     */
    public ?int $userId;

    /**
     * Tạo một instance mới của sự kiện.
     */
    public function __construct(?string $message = null, ?int $userId = null)
    {
        $this->message = $message ?? 'Device data has been updated';
        $this->userId = $userId;
    }

    /**
     * Tên event broadcast
     */
    public function broadcastAs(): string
    {
        return 'devices.reload';
    }

    /**
     * Channel mà event sẽ broadcast tới
     */
    public function broadcastOn(): Channel
    {
        // Nếu có userId, gửi private channel cho user đó
        if ($this->userId) {
            return new PrivateChannel("user.{$this->userId}.devices");
        }
        
        // Public channel cho tất cả users quản lý devices
        return new Channel('devices');
    }

    /**
     * Payload gửi đi kèm event
     */
    public function broadcastWith(): array
    {
        return [
            'message' => $this->message,
            'timestamp' => now()->format('Y-m-d H:i:s'),
            'user_id' => $this->userId,
            'channel_type' => $this->userId ? 'private' : 'public'
        ];
    }
}

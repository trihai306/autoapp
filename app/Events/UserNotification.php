<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class UserNotification implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * @var array
     */
    public array $notification;

    /**
     * @var int User ID để gửi private channel
     */
    public int $userId;

    /**
     * Tạo một instance mới của sự kiện.
     */
    public function __construct(array $notification, int $userId)
    {
        $this->notification = $notification;
        $this->userId = $userId;
    }

    /**
     * Tên event broadcast
     */
    public function broadcastAs(): string
    {
        return 'user.notification';
    }

    /**
     * Channel mà event sẽ broadcast tới
     */
    public function broadcastOn(): Channel
    {
        // Sử dụng channel private-user.{id}
        return new PrivateChannel("private-user.{$this->userId}");
    }

    /**
     * Payload gửi đi kèm event
     */
    public function broadcastWith(): array
    {
        return [
            'notification' => $this->notification,
            'timestamp' => now()->format('Y-m-d H:i:s'),
            'user_id' => $this->userId,
            'channel_type' => 'private-user'
        ];
    }
}

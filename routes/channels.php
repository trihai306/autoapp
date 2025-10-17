<?php

use Illuminate\Support\Facades\Broadcast;
use App\Models\Device;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

// Channel cho user notifications và private channels
Broadcast::channel('private-user.{id}', function ($user, $id) {
    \Log::info('Channel authorization debug', [
        'user_id' => $user->id,
        'channel_id' => $id,
        'user_id_type' => gettype($user->id),
        'channel_id_type' => gettype($id),
        'comparison' => (int) $user->id === (int) $id,
        'channel_name' => 'private-user.' . $id
    ]);
    return (int) $user->id === (int) $id;
});

// Channel authorization đơn giản cho testing
Broadcast::channel('test-channel', function ($user) {
    \Log::info('Test channel authorization', [
        'user_id' => $user->id,
        'channel' => 'test-channel'
    ]);
    return true; // Allow all authenticated users
});

  /*
    |--------------------------------------------------------------------------
    | Device Channels
    |--------------------------------------------------------------------------
    */

    // Channel cho device cụ thể - chấp nhận cả device.id (số) và device_id (chuỗi)
    Broadcast::channel('device.{identifier}', function ($user, $identifier) {
        // Tìm device theo device_id trước, nếu không có thì tìm theo id
        $device = Device::where('device_id', $identifier)->first();

        // Không tìm thấy thiết bị
        if (!$device) {
            return false;
        }
        return $user->id === $device->user_id;
    });

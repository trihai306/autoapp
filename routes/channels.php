<?php

use Illuminate\Support\Facades\Broadcast;
use App\Models\Device;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
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

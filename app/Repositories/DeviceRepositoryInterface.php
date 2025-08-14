<?php

namespace App\Repositories;

use App\Models\Device;

interface DeviceRepositoryInterface extends BaseRepositoryInterface
{
    /**
     * Tìm thiết bị theo device_id
     *
     * @param string $deviceId
     * @return Device|null
     */
    public function findByDeviceId(string $deviceId): ?Device;

    /**
     * Cập nhật hoặc tạo mới thiết bị
     *
     * @param array $searchAttributes
     * @param array $updateAttributes
     * @return Device
     */
    public function updateOrCreate(array $searchAttributes, array $updateAttributes): Device;

    /**
     * Tìm thiết bị theo user_id
     *
     * @param int $userId
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function findByUserId(int $userId);

    /**
     * Cập nhật trạng thái online/offline
     *
     * @param string $deviceId
     * @param bool $isOnline
     * @return Device|null
     */
    public function updateOnlineStatus(string $deviceId, bool $isOnline): ?Device;

    /**
     * Lấy thiết bị online
     *
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function getOnlineDevices();

    /**
     * Lấy thiết bị offline
     *
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function getOfflineDevices();
}

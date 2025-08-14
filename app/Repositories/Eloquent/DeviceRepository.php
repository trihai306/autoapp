<?php

namespace App\Repositories\Eloquent;

use App\Models\Device;
use App\Repositories\DeviceRepositoryInterface;

class DeviceRepository extends BaseRepository implements DeviceRepositoryInterface
{
    /**
     * @param Device $model
     */
    public function __construct(Device $model)
    {
        parent::__construct($model);
    }

    /**
     * Tìm thiết bị theo device_id
     *
     * @param string $deviceId
     * @return Device|null
     */
    public function findByDeviceId(string $deviceId): ?Device
    {
        return $this->model->where('device_id', $deviceId)->first();
    }

    /**
     * Cập nhật hoặc tạo mới thiết bị
     *
     * @param array $searchAttributes
     * @param array $updateAttributes
     * @return Device
     */
    public function updateOrCreate(array $searchAttributes, array $updateAttributes): Device
    {
        return $this->model->updateOrCreate($searchAttributes, $updateAttributes);
    }

    /**
     * Tìm thiết bị theo user_id
     *
     * @param int $userId
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function findByUserId(int $userId)
    {
        return $this->model->where('user_id', $userId)->get();
    }

    /**
     * Cập nhật trạng thái online/offline
     *
     * @param string $deviceId
     * @param bool $isOnline
     * @return Device|null
     */
    public function updateOnlineStatus(string $deviceId, bool $isOnline): ?Device
    {
        $device = $this->findByDeviceId($deviceId);
        if ($device) {
            $device->update(['is_online' => $isOnline]);
            return $device->fresh();
        }
        return null;
    }

    /**
     * Lấy thiết bị online
     *
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function getOnlineDevices()
    {
        return $this->model->where('is_online', true)->get();
    }

    /**
     * Lấy thiết bị offline
     *
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function getOfflineDevices()
    {
        return $this->model->where('is_online', false)->get();
    }
}

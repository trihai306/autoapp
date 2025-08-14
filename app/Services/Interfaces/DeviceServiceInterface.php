<?php

namespace App\Services\Interfaces;

use App\Models\Device;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;

interface DeviceServiceInterface
{
    /**
     * Lấy danh sách thiết bị với phân trang
     *
     * @param Request $request
     * @return LengthAwarePaginator
     */
    public function getAll(Request $request): LengthAwarePaginator;

    /**
     * Lấy thiết bị theo ID
     *
     * @param int $id
     * @return Device|null
     */
    public function getById(int $id): ?Device;

    /**
     * Tạo thiết bị mới
     *
     * @param array $data
     * @return Device
     */
    public function create(array $data): Device;

    /**
     * Cập nhật thiết bị
     *
     * @param Device $device
     * @param array $data
     * @return Device
     */
    public function update(Device $device, array $data): Device;

    /**
     * Xóa thiết bị
     *
     * @param Device $device
     * @return bool
     */
    public function delete(Device $device): bool;

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
     * @param array $data
     * @return Device
     */
    public function updateOrCreate(array $data): Device;

    /**
     * Cập nhật trạng thái online/offline
     *
     * @param string $deviceId
     * @param bool $isOnline
     * @return Device|null
     */
    public function updateOnlineStatus(string $deviceId, bool $isOnline): ?Device;
}

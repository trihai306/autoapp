<?php

namespace App\Services;

use App\Models\Device;
use App\Queries\BaseQuery;
use App\Repositories\DeviceRepositoryInterface;
use App\Services\Interfaces\DeviceServiceInterface;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use App\Events\DeviceTableReload;

class DeviceService implements DeviceServiceInterface
{
    protected DeviceRepositoryInterface $deviceRepository;

    public function __construct(DeviceRepositoryInterface $deviceRepository)
    {
        $this->deviceRepository = $deviceRepository;
    }

    public function getAll(Request $request): LengthAwarePaginator
    {
        $query = $this->deviceRepository->getModel()->query();
        return BaseQuery::for($query, $request)->paginate();
    }

    public function getById(int $id): ?Device
    {
        return $this->deviceRepository->find($id);
    }

    public function create(array $data): Device
    {
        $device = $this->deviceRepository->create($data);
        
        // Dispatch event để làm mới bảng
        event(new DeviceTableReload('Thiết bị mới đã được tạo', $data['user_id'] ?? null));
        
        return $device;
    }

    public function update(Device $device, array $data): Device
    {
        $updatedDevice = $this->deviceRepository->update($device, $data);
        
        // Dispatch event để làm mới bảng
        event(new DeviceTableReload('Thiết bị đã được cập nhật', $data['user_id'] ?? $device->user_id));
        
        return $updatedDevice;
    }

    public function delete(Device $device): bool
    {
        $result = $this->deviceRepository->delete($device);
        
        // Bỏ tính năng reload table khi xóa device
        // if ($result) {
        //     // Dispatch event để làm mới bảng
        //     event(new DeviceTableReload('Thiết bị đã được xóa', $userId));
        // }
        
        return $result;
    }

    public function findByDeviceId(string $deviceId): ?Device
    {
        return $this->deviceRepository->findByDeviceId($deviceId);
    }

    public function updateOrCreate(array $data): Device
    {
        $searchAttributes = [];
        if (!empty($data['device_id'])) {
            $searchAttributes['device_id'] = $data['device_id'];
        }

        $device = $this->deviceRepository->updateOrCreate($searchAttributes, $data);
        
        // Dispatch event để làm mới bảng
        event(new DeviceTableReload('Thiết bị đã được cập nhật hoặc tạo mới', $data['user_id'] ?? null));
        
        return $device;
    }

    public function updateOnlineStatus(string $deviceId, bool $isOnline): ?Device
    {
        $device = $this->deviceRepository->updateOnlineStatus($deviceId, $isOnline);
        
        if ($device) {
            // Dispatch event để làm mới bảng
            event(new DeviceTableReload(
                'Trạng thái online của thiết bị đã được cập nhật', 
                $device->user_id
            ));
        }
        
        return $device;
    }
}

<?php

namespace App\Services;

use App\Models\Device;
use App\Queries\BaseQuery;
use App\Repositories\DeviceRepositoryInterface;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;

class DeviceService
{
    protected $deviceRepository;

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
        return $this->deviceRepository->create($data);
    }

    public function update(Device $device, array $data): Device
    {
        $this->deviceRepository->update($device, $data);
        return $device->fresh();
    }

    public function delete(Device $device): bool
    {
        return $this->deviceRepository->delete($device);
    }
}

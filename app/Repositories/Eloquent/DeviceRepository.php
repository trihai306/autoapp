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
}

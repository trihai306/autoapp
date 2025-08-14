<?php

namespace App\Repositories\Eloquent;

use App\Repositories\PermissionRepositoryInterface;
use App\Models\Permission;
use App\Repositories\Eloquent\BaseRepository;

class PermissionRepository extends BaseRepository implements PermissionRepositoryInterface
{
    public function __construct(Permission $model)
    {
        parent::__construct($model);
    }

    public function deleteByIds(array $ids): int
    {
        return $this->model->whereIn('id', $ids)->delete();
    }
}

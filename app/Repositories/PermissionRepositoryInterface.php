<?php

namespace App\Repositories;

interface PermissionRepositoryInterface extends BaseRepositoryInterface
{
    public function deleteByIds(array $ids): int;
}

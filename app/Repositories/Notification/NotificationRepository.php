<?php

namespace App\Repositories\Notification;

use App\Models\Notification;
use App\Repositories\Eloquent\BaseRepository;

class NotificationRepository extends BaseRepository implements NotificationRepositoryInterface
{
    /**
     * NotificationRepository constructor.
     *
     * @param Notification $model
     */
    public function __construct(Notification $model)
    {
        parent::__construct($model);
    }

    public function deleteByIds(array $ids): int
    {
        return $this->model->whereIn('id', $ids)->delete();
    }
}

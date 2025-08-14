<?php

namespace App\Repositories\Eloquent;

use App\Models\ContentGroup;
use App\Repositories\ContentGroupRepositoryInterface;

class ContentGroupRepository extends BaseRepository implements ContentGroupRepositoryInterface
{
    /**
     * ContentGroupRepository constructor.
     *
     * @param ContentGroup $model
     */
    public function __construct(ContentGroup $model)
    {
        parent::__construct($model);
    }

    /**
     * Find content group by ID with contents count
     *
     * @param int $id
     * @return ContentGroup|null
     */
    public function findWithContentsCount(int $id): ?ContentGroup
    {
        return $this->model->withCount('contents')->find($id);
    }

    /**
     * Get all content groups for a specific user
     *
     * @param int $userId
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function getByUserId(int $userId)
    {
        return $this->model->where('user_id', $userId)->get();
    }

    /**
     * Delete multiple content groups by IDs
     *
     * @param array $ids
     * @return int
     */
    public function deleteByIds(array $ids): int
    {
        return $this->model->whereIn('id', $ids)->delete();
    }

    /**
     * Update multiple content groups by IDs
     *
     * @param array $ids
     * @param array $data
     * @return int
     */
    public function updateByIds(array $ids, array $data): int
    {
        return $this->model->whereIn('id', $ids)->update($data);
    }
}

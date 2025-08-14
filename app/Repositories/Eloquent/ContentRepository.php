<?php

namespace App\Repositories\Eloquent;

use App\Models\Content;
use App\Repositories\ContentRepositoryInterface;

class ContentRepository extends BaseRepository implements ContentRepositoryInterface
{
    /**
     * ContentRepository constructor.
     *
     * @param Content $model
     */
    public function __construct(Content $model)
    {
        parent::__construct($model);
    }

    /**
     * Find content by ID with relationships
     *
     * @param int $id
     * @return Content|null
     */
    public function findWithRelations(int $id): ?Content
    {
        return $this->model->with(['user', 'contentGroup'])->find($id);
    }

    /**
     * Get all contents for a specific user
     *
     * @param int $userId
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function getByUserId(int $userId)
    {
        return $this->model->where('user_id', $userId)->get();
    }

    /**
     * Get all contents for a specific content group
     *
     * @param int $contentGroupId
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function getByContentGroupId(int $contentGroupId)
    {
        return $this->model->where('content_group_id', $contentGroupId)->get();
    }

    /**
     * Delete multiple contents by IDs
     *
     * @param array $ids
     * @return int
     */
    public function deleteByIds(array $ids): int
    {
        return $this->model->whereIn('id', $ids)->delete();
    }

    /**
     * Update multiple contents by IDs
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

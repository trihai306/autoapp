<?php

namespace App\Repositories;

use App\Models\Content;

interface ContentRepositoryInterface extends BaseRepositoryInterface
{
    /**
     * Find content by ID with relationships
     *
     * @param int $id
     * @return Content|null
     */
    public function findWithRelations(int $id): ?Content;

    /**
     * Get all contents for a specific user
     *
     * @param int $userId
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function getByUserId(int $userId);

    /**
     * Get all contents for a specific content group
     *
     * @param int $contentGroupId
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function getByContentGroupId(int $contentGroupId);

    /**
     * Delete multiple contents by IDs
     *
     * @param array $ids
     * @return int
     */
    public function deleteByIds(array $ids): int;

    /**
     * Update multiple contents by IDs
     *
     * @param array $ids
     * @param array $data
     * @return int
     */
    public function updateByIds(array $ids, array $data): int;
}

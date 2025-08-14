<?php

namespace App\Repositories;

use App\Models\ContentGroup;

interface ContentGroupRepositoryInterface extends BaseRepositoryInterface
{
    /**
     * Find content group by ID with contents count
     *
     * @param int $id
     * @return ContentGroup|null
     */
    public function findWithContentsCount(int $id): ?ContentGroup;

    /**
     * Get all content groups for a specific user
     *
     * @param int $userId
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function getByUserId(int $userId);

    /**
     * Delete multiple content groups by IDs
     *
     * @param array $ids
     * @return int
     */
    public function deleteByIds(array $ids): int;

    /**
     * Update multiple content groups by IDs
     *
     * @param array $ids
     * @param array $data
     * @return int
     */
    public function updateByIds(array $ids, array $data): int;
}

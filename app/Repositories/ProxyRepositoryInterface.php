<?php

namespace App\Repositories;

use App\Models\Proxy;

interface ProxyRepositoryInterface extends BaseRepositoryInterface
{
    /**
     * Find proxy by user ID
     *
     * @param int $userId
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function findByUserId(int $userId);

    /**
     * Find active proxies by user ID
     *
     * @param int $userId
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function findActiveByUserId(int $userId);

    /**
     * Find proxy by type and status
     *
     * @param string $type
     * @param string $status
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function findByTypeAndStatus(string $type, string $status);

    /**
     * Update last used timestamp
     *
     * @param Proxy $proxy
     * @return Proxy
     */
    public function updateLastUsed(Proxy $proxy): Proxy;

    /**
     * Update last tested timestamp
     *
     * @param Proxy $proxy
     * @return Proxy
     */
    public function updateLastTested(Proxy $proxy): Proxy;

    /**
     * Get proxy statistics for user
     *
     * @param int $userId
     * @return array
     */
    public function getStatistics(int $userId): array;
}

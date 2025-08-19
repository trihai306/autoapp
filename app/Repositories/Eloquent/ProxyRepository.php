<?php

namespace App\Repositories\Eloquent;

use App\Models\Proxy;
use App\Repositories\ProxyRepositoryInterface;
use App\Repositories\Eloquent\BaseRepository;

class ProxyRepository extends BaseRepository implements ProxyRepositoryInterface
{
    /**
     * ProxyRepository constructor.
     *
     * @param Proxy $model
     */
    public function __construct(Proxy $model)
    {
        parent::__construct($model);
    }

    /**
     * Find proxy by user ID
     *
     * @param int $userId
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function findByUserId(int $userId)
    {
        return $this->model->where('user_id', $userId)->get();
    }

    /**
     * Find active proxies by user ID
     *
     * @param int $userId
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function findActiveByUserId(int $userId)
    {
        return $this->model->where('user_id', $userId)
            ->where('status', 'active')
            ->get();
    }

    /**
     * Find proxy by type and status
     *
     * @param string $type
     * @param string $status
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function findByTypeAndStatus(string $type, string $status)
    {
        return $this->model->where('type', $type)
            ->where('status', $status)
            ->get();
    }

    /**
     * Update last used timestamp
     *
     * @param Proxy $proxy
     * @return Proxy
     */
    public function updateLastUsed(Proxy $proxy): Proxy
    {
        $proxy->update(['last_used_at' => now()]);
        return $proxy->fresh();
    }

    /**
     * Update last tested timestamp
     *
     * @param Proxy $proxy
     * @return Proxy
     */
    public function updateLastTested(Proxy $proxy): Proxy
    {
        $proxy->update(['last_tested_at' => now()]);
        return $proxy->fresh();
    }

    /**
     * Get proxy statistics for user
     *
     * @param int $userId
     * @return array
     */
    public function getStatistics(int $userId): array
    {
        $query = $this->model->where('user_id', $userId);

        $total = $query->count();
        $active = $query->where('status', 'active')->count();
        $inactive = $query->where('status', 'inactive')->count();
        $error = $query->where('status', 'error')->count();

        // Get type distribution
        $typeDistribution = $query->select('type')
            ->selectRaw('count(*) as count')
            ->groupBy('type')
            ->get()
            ->map(function ($item) {
                return [
                    'type' => $item->type,
                    'count' => $item->count
                ];
            });

        // Get country distribution
        $countryDistribution = $query->select('country')
            ->selectRaw('count(*) as count')
            ->whereNotNull('country')
            ->groupBy('country')
            ->get()
            ->map(function ($item) {
                return [
                    'country' => $item->country,
                    'count' => $item->count
                ];
            });

        return [
            'total' => $total,
            'active' => $active,
            'inactive' => $inactive,
            'error' => $error,
            'active_rate' => $total > 0 ? round(($active / $total) * 100, 1) : 0,
            'type_distribution' => $typeDistribution,
            'country_distribution' => $countryDistribution,
        ];
    }
}

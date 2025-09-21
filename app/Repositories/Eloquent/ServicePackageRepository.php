<?php

namespace App\Repositories\Eloquent;

use App\Models\ServicePackage;
use App\Repositories\ServicePackageRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

class ServicePackageRepository implements ServicePackageRepositoryInterface
{
    protected $model;

    public function __construct(ServicePackage $model)
    {
        $this->model = $model;
    }

    /**
     * Lấy tất cả packages
     */
    public function getAll(array $filters = []): Collection|LengthAwarePaginator
    {
        $query = $this->model->newQuery();

        // Áp dụng filters
        if (isset($filters['is_active'])) {
            $query->where('is_active', $filters['is_active']);
        }

        if (isset($filters['is_popular'])) {
            $query->where('is_popular', $filters['is_popular']);
        }

        if (isset($filters['category_id'])) {
            $query->where('category_id', $filters['category_id']);
        }

        if (isset($filters['platform'])) {
            $query->where('platform', $filters['platform']);
        }

        if (isset($filters['duration_type'])) {
            $query->where('duration_type', $filters['duration_type']);
        }

        if (isset($filters['min_duration'])) {
            $query->where('duration_value', '>=', $filters['min_duration']);
        }

        if (isset($filters['max_duration'])) {
            $query->where('duration_value', '<=', $filters['max_duration']);
        }

        if (isset($filters['search'])) {
            $query->where(function ($q) use ($filters) {
                $q->where('name', 'like', '%' . $filters['search'] . '%')
                  ->orWhere('description', 'like', '%' . $filters['search'] . '%');
            });
        }

        // Sắp xếp
        $query->orderBy('sort_order')->orderBy('duration_value');

        // Phân trang hoặc trả về collection
        if (isset($filters['per_page'])) {
            return $query->paginate($filters['per_page']);
        }

        return $query->get();
    }

    /**
     * Lấy package theo ID
     */
    public function find(int $id): ?ServicePackage
    {
        return $this->model->find($id);
    }

    /**
     * Tạo package mới
     */
    public function create(array $data): ServicePackage
    {
        return $this->model->create($data);
    }

    /**
     * Cập nhật package
     */
    public function update(ServicePackage $package, array $data): ServicePackage
    {
        $package->update($data);
        return $package->fresh();
    }

    /**
     * Xóa package
     */
    public function delete(ServicePackage $package): bool
    {
        return $package->delete();
    }

    /**
     * Lấy query builder
     */
    public function query()
    {
        return $this->model->newQuery();
    }

    /**
     * Đếm số lượng packages
     */
    public function count(): int
    {
        return $this->model->count();
    }

    /**
     * Lấy packages đang hoạt động
     */
    public function getActive(): Collection
    {
        return $this->model->where('is_active', true)
                          ->orderBy('sort_order')
                          ->orderBy('duration_value')
                          ->get();
    }

    /**
     * Lấy packages theo category
     */
    public function getByCategory(int $categoryId): Collection
    {
        return $this->model->where('category_id', $categoryId)
                          ->where('is_active', true)
                          ->orderBy('duration_value')
                          ->get();
    }

    /**
     * Lấy packages theo platform
     */
    public function getByPlatform(string $platform): Collection
    {
        return $this->model->where('platform', $platform)
                          ->where('is_active', true)
                          ->orderBy('duration_value')
                          ->get();
    }

    /**
     * Lấy packages theo duration type
     */
    public function getByDurationType(string $durationType): Collection
    {
        return $this->model->where('duration_type', $durationType)
                          ->where('is_active', true)
                          ->orderBy('duration_value')
                          ->get();
    }

    /**
     * Lấy packages với tiers
     */
    public function getAllWithTiers(array $filters = []): Collection
    {
        $query = $this->model->with(['tiers' => function ($query) {
            $query->where('is_active', true)
                  ->orderBy('sort_order')
                  ->orderBy('device_limit');
        }]);

        // Áp dụng filters
        if (isset($filters['is_active'])) {
            $query->where('is_active', $filters['is_active']);
        }

        if (isset($filters['category_id'])) {
            $query->where('category_id', $filters['category_id']);
        }

        if (isset($filters['platform'])) {
            $query->where('platform', $filters['platform']);
        }

        return $query->orderBy('sort_order')
                    ->orderBy('duration_value')
                    ->get();
    }

    /**
     * Lấy packages phổ biến
     */
    public function getPopular(): Collection
    {
        return $this->model->where('is_popular', true)
                          ->where('is_active', true)
                          ->orderBy('sort_order')
                          ->orderBy('duration_value')
                          ->get();
    }

    /**
     * Lấy packages theo khoảng giá tiers
     */
    public function getByTierPriceRange(float $minPrice, float $maxPrice): Collection
    {
        return $this->model->whereHas('tiers', function ($query) use ($minPrice, $maxPrice) {
            $query->where('price', '>=', $minPrice)
                  ->where('price', '<=', $maxPrice)
                  ->where('is_active', true);
        })
        ->where('is_active', true)
        ->orderBy('sort_order')
        ->orderBy('duration_value')
        ->get();
    }

    /**
     * Lấy packages với thông tin category
     */
    public function getWithCategory(array $filters = []): Collection
    {
        $query = $this->model->with('category');

        // Áp dụng filters
        if (isset($filters['is_active'])) {
            $query->where('is_active', $filters['is_active']);
        }

        if (isset($filters['category_id'])) {
            $query->where('category_id', $filters['category_id']);
        }

        if (isset($filters['platform'])) {
            $query->where('platform', $filters['platform']);
        }

        return $query->orderBy('sort_order')
                    ->orderBy('duration_value')
                    ->get();
    }

    /**
     * Cập nhật thứ tự packages
     */
    public function updateSortOrder(array $sortData): bool
    {
        try {
            foreach ($sortData as $item) {
                $this->model->where('id', $item['id'])
                           ->update(['sort_order' => $item['sort_order']]);
            }
            
            return true;
        } catch (\Exception $e) {
            return false;
        }
    }

    /**
     * Lấy thống kê tổng quan
     */
    public function getOverviewStats(): array
    {
        $totalPackages = $this->model->count();
        $activePackages = $this->model->where('is_active', true)->count();
        $popularPackages = $this->model->where('is_popular', true)->count();

        $durationStats = $this->model->where('is_active', true)
                                   ->selectRaw('
                                       COUNT(CASE WHEN duration_type = "days" THEN 1 END) as days_count,
                                       COUNT(CASE WHEN duration_type = "months" THEN 1 END) as months_count,
                                       COUNT(CASE WHEN duration_type = "years" THEN 1 END) as years_count
                                   ')
                                   ->first();

        $platformStats = $this->model->where('is_active', true)
                                    ->selectRaw('platform, COUNT(*) as count')
                                    ->groupBy('platform')
                                    ->get()
                                    ->pluck('count', 'platform');

        return [
            'total_packages' => $totalPackages,
            'active_packages' => $activePackages,
            'inactive_packages' => $totalPackages - $activePackages,
            'popular_packages' => $popularPackages,
            'duration_stats' => [
                'days' => $durationStats->days_count ?? 0,
                'months' => $durationStats->months_count ?? 0,
                'years' => $durationStats->years_count ?? 0,
            ],
            'platform_stats' => $platformStats->toArray(),
        ];
    }
}

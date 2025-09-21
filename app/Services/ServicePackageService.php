<?php

namespace App\Services;

use App\Models\ServicePackage;
use App\Repositories\ServicePackageRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

class ServicePackageService
{
    protected $repository;

    public function __construct(ServicePackageRepositoryInterface $repository)
    {
        $this->repository = $repository;
    }

    /**
     * Lấy tất cả packages
     */
    public function getAll(array $filters = []): LengthAwarePaginator|Collection
    {
        $query = $this->repository->query();

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
    public function getById(int $id): ?ServicePackage
    {
        return $this->repository->find($id);
    }

    /**
     * Tạo package mới
     */
    public function create(array $data): ServicePackage
    {
        return $this->repository->create($data);
    }

    /**
     * Cập nhật package
     */
    public function update(int $id, array $data): ?ServicePackage
    {
        $package = $this->repository->find($id);
        
        if (!$package) {
            return null;
        }

        return $this->repository->update($package, $data);
    }

    /**
     * Xóa package
     */
    public function delete(int $id): bool
    {
        $package = $this->repository->find($id);
        
        if (!$package) {
            return false;
        }

        return $this->repository->delete($package);
    }

    /**
     * Lấy packages theo category
     */
    public function getByCategory(int $categoryId): Collection
    {
        return $this->repository->query()
            ->where('category_id', $categoryId)
            ->where('is_active', true)
            ->orderBy('duration_value')
            ->get();
    }

    /**
     * Lấy packages theo platform
     */
    public function getByPlatform(string $platform): Collection
    {
        return $this->repository->query()
            ->where('platform', $platform)
            ->where('is_active', true)
            ->orderBy('duration_value')
            ->get();
    }

    /**
     * Lấy packages theo duration type
     */
    public function getByDurationType(string $durationType): Collection
    {
        return $this->repository->query()
            ->where('duration_type', $durationType)
            ->where('is_active', true)
            ->orderBy('duration_value')
            ->get();
    }

    /**
     * Lấy package với tiers
     */
    public function getWithTiers(int $id): ?ServicePackage
    {
        return $this->repository->query()
            ->with(['tiers' => function ($query) {
                $query->where('is_active', true)
                      ->orderBy('sort_order')
                      ->orderBy('device_limit');
            }])
            ->find($id);
    }

    /**
     * Lấy packages với tiers
     */
    public function getAllWithTiers(array $filters = []): Collection
    {
        $query = $this->repository->query()
            ->with(['tiers' => function ($query) {
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
     * Lấy tier phù hợp cho package
     */
    public function recommendTier(int $packageId, int $deviceCount): ?ServicePackage
    {
        $package = $this->repository->query()
            ->with(['tiers' => function ($query) use ($deviceCount) {
                $query->where('is_active', true)
                      ->where('device_limit', '>=', $deviceCount)
                      ->orderBy('device_limit')
                      ->orderBy('price');
            }])
            ->find($packageId);

        return $package;
    }

    /**
     * Lấy packages phổ biến
     */
    public function getPopular(): Collection
    {
        return $this->repository->query()
            ->where('is_popular', true)
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
        return $this->repository->query()
            ->whereHas('tiers', function ($query) use ($minPrice, $maxPrice) {
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
        $query = $this->repository->query()->with('category');

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
     * Kích hoạt/vô hiệu hóa package
     */
    public function toggleActive(int $id): ?ServicePackage
    {
        $package = $this->repository->find($id);
        
        if (!$package) {
            return null;
        }

        $package->update(['is_active' => !$package->is_active]);
        
        return $package;
    }

    /**
     * Đặt package phổ biến
     */
    public function setPopular(int $id): ?ServicePackage
    {
        $package = $this->repository->find($id);
        
        if (!$package) {
            return null;
        }

        // Bỏ phổ biến cho các package khác cùng category
        $this->repository->query()
            ->where('category_id', $package->category_id)
            ->where('id', '!=', $id)
            ->update(['is_popular' => false]);

        // Đặt package này là phổ biến
        $package->update(['is_popular' => true]);
        
        return $package;
    }

    /**
     * Cập nhật thứ tự packages
     */
    public function updateSortOrder(array $sortData): bool
    {
        try {
            foreach ($sortData as $item) {
                $this->repository->update(
                    $this->repository->find($item['id']),
                    ['sort_order' => $item['sort_order']]
                );
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
        $totalPackages = $this->repository->count();
        $activePackages = $this->repository->query()->where('is_active', true)->count();
        $popularPackages = $this->repository->query()->where('is_popular', true)->count();

        $durationStats = $this->repository->query()
            ->where('is_active', true)
            ->selectRaw('
                COUNT(CASE WHEN duration_type = "days" THEN 1 END) as days_count,
                COUNT(CASE WHEN duration_type = "months" THEN 1 END) as months_count,
                COUNT(CASE WHEN duration_type = "years" THEN 1 END) as years_count
            ')
            ->first();

        $platformStats = $this->repository->query()
            ->where('is_active', true)
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

<?php

namespace App\Services;

use App\Models\ServicePackageTier;
use App\Repositories\ServicePackageTierRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

class ServicePackageTierService
{
    protected $repository;

    public function __construct(ServicePackageTierRepositoryInterface $repository)
    {
        $this->repository = $repository;
    }

    /**
     * Lấy tất cả tiers
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

        if (isset($filters['service_package_id'])) {
            $query->where('service_package_id', $filters['service_package_id']);
        }

        if (isset($filters['min_price'])) {
            $query->where('price', '>=', $filters['min_price']);
        }

        if (isset($filters['max_price'])) {
            $query->where('price', '<=', $filters['max_price']);
        }

        if (isset($filters['min_device_limit'])) {
            $query->where('device_limit', '>=', $filters['min_device_limit']);
        }

        if (isset($filters['max_device_limit'])) {
            $query->where('device_limit', '<=', $filters['max_device_limit']);
        }

        if (isset($filters['search'])) {
            $query->where(function ($q) use ($filters) {
                $q->where('name', 'like', '%' . $filters['search'] . '%')
                  ->orWhere('description', 'like', '%' . $filters['search'] . '%');
            });
        }

        // Sắp xếp
        $query->orderBy('sort_order')->orderBy('device_limit');

        // Phân trang hoặc trả về collection
        if (isset($filters['per_page'])) {
            return $query->paginate($filters['per_page']);
        }

        return $query->get();
    }

    /**
     * Lấy tier theo ID
     */
    public function getById(int $id): ?ServicePackageTier
    {
        return $this->repository->find($id);
    }

    /**
     * Tạo tier mới
     */
    public function create(array $data): ServicePackageTier
    {
        return $this->repository->create($data);
    }

    /**
     * Cập nhật tier
     */
    public function update(int $id, array $data): ?ServicePackageTier
    {
        $tier = $this->repository->find($id);
        
        if (!$tier) {
            return null;
        }

        return $this->repository->update($tier, $data);
    }

    /**
     * Xóa tier
     */
    public function delete(int $id): bool
    {
        $tier = $this->repository->find($id);
        
        if (!$tier) {
            return false;
        }

        return $this->repository->delete($tier);
    }

    /**
     * Lấy tiers theo package
     */
    public function getByPackage(int $packageId): Collection
    {
        return $this->repository->query()
            ->where('service_package_id', $packageId)
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->orderBy('device_limit')
            ->get();
    }

    /**
     * Lấy tiers theo số lượng thiết bị
     */
    public function getByDeviceLimit(int $deviceLimit): Collection
    {
        return $this->repository->query()
            ->where('device_limit', '>=', $deviceLimit)
            ->where('is_active', true)
            ->orderBy('device_limit')
            ->get();
    }

    /**
     * Lấy tier phù hợp nhất cho số lượng thiết bị
     */
    public function recommendTier(array $criteria): ?ServicePackageTier
    {
        $query = $this->repository->query()
            ->where('is_active', true)
            ->where('device_limit', '>=', $criteria['device_count']);

        if (isset($criteria['package_id'])) {
            $query->where('service_package_id', $criteria['package_id']);
        }

        if (isset($criteria['category_id'])) {
            $query->whereHas('package', function ($q) use ($criteria) {
                $q->where('category_id', $criteria['category_id']);
            });
        }

        return $query->orderBy('device_limit')
                    ->orderBy('price')
                    ->first();
    }

    /**
     * Lấy tiers phổ biến
     */
    public function getPopular(): Collection
    {
        return $this->repository->query()
            ->where('is_popular', true)
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->orderBy('device_limit')
            ->get();
    }

    /**
     * Lấy tiers theo khoảng giá
     */
    public function getByPriceRange(float $minPrice, float $maxPrice): Collection
    {
        return $this->repository->query()
            ->where('price', '>=', $minPrice)
            ->where('price', '<=', $maxPrice)
            ->where('is_active', true)
            ->orderBy('price')
            ->get();
    }

    /**
     * Lấy tiers với thông tin package
     */
    public function getWithPackage(array $filters = []): Collection
    {
        $query = $this->repository->query()->with('package');

        // Áp dụng filters
        if (isset($filters['is_active'])) {
            $query->where('is_active', $filters['is_active']);
        }

        if (isset($filters['platform'])) {
            $query->whereHas('package', function ($q) use ($filters) {
                $q->where('platform', $filters['platform']);
            });
        }

        if (isset($filters['category_id'])) {
            $query->whereHas('package', function ($q) use ($filters) {
                $q->where('category_id', $filters['category_id']);
            });
        }

        return $query->orderBy('sort_order')
                    ->orderBy('device_limit')
                    ->get();
    }

    /**
     * Kích hoạt/vô hiệu hóa tier
     */
    public function toggleActive(int $id): ?ServicePackageTier
    {
        $tier = $this->repository->find($id);
        
        if (!$tier) {
            return null;
        }

        $tier->update(['is_active' => !$tier->is_active]);
        
        return $tier;
    }

    /**
     * Đặt tier phổ biến
     */
    public function setPopular(int $id): ?ServicePackageTier
    {
        $tier = $this->repository->find($id);
        
        if (!$tier) {
            return null;
        }

        // Bỏ phổ biến cho các tier khác cùng package
        $this->repository->query()
            ->where('service_package_id', $tier->service_package_id)
            ->where('id', '!=', $id)
            ->update(['is_popular' => false]);

        // Đặt tier này là phổ biến
        $tier->update(['is_popular' => true]);
        
        return $tier;
    }

    /**
     * Cập nhật thứ tự tiers
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
        $totalTiers = $this->repository->count();
        $activeTiers = $this->repository->query()->where('is_active', true)->count();
        $popularTiers = $this->repository->query()->where('is_popular', true)->count();

        $priceStats = $this->repository->query()
            ->where('is_active', true)
            ->selectRaw('MIN(price) as min_price, MAX(price) as max_price, AVG(price) as avg_price')
            ->first();

        return [
            'total_tiers' => $totalTiers,
            'active_tiers' => $activeTiers,
            'inactive_tiers' => $totalTiers - $activeTiers,
            'popular_tiers' => $popularTiers,
            'min_price' => $priceStats->min_price ?? 0,
            'max_price' => $priceStats->max_price ?? 0,
            'avg_price' => round($priceStats->avg_price ?? 0, 2),
        ];
    }
}

<?php

namespace App\Repositories\Eloquent;

use App\Models\ServicePackageTier;
use App\Repositories\ServicePackageTierRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

class ServicePackageTierRepository implements ServicePackageTierRepositoryInterface
{
    protected $model;

    public function __construct(ServicePackageTier $model)
    {
        $this->model = $model;
    }

    /**
     * Lấy tất cả tiers
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
    public function find(int $id): ?ServicePackageTier
    {
        return $this->model->find($id);
    }

    /**
     * Tạo tier mới
     */
    public function create(array $data): ServicePackageTier
    {
        return $this->model->create($data);
    }

    /**
     * Cập nhật tier
     */
    public function update(ServicePackageTier $tier, array $data): ServicePackageTier
    {
        $tier->update($data);
        return $tier->fresh();
    }

    /**
     * Xóa tier
     */
    public function delete(ServicePackageTier $tier): bool
    {
        return $tier->delete();
    }

    /**
     * Lấy query builder
     */
    public function query()
    {
        return $this->model->newQuery();
    }

    /**
     * Đếm số lượng tiers
     */
    public function count(): int
    {
        return $this->model->count();
    }

    /**
     * Lấy tiers đang hoạt động
     */
    public function getActive(): Collection
    {
        return $this->model->where('is_active', true)
                          ->orderBy('sort_order')
                          ->orderBy('device_limit')
                          ->get();
    }

    /**
     * Lấy tiers theo package
     */
    public function getByPackage(int $packageId): Collection
    {
        return $this->model->where('service_package_id', $packageId)
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
        return $this->model->where('device_limit', '>=', $deviceLimit)
                          ->where('is_active', true)
                          ->orderBy('device_limit')
                          ->get();
    }

    /**
     * Lấy tiers phổ biến
     */
    public function getPopular(): Collection
    {
        return $this->model->where('is_popular', true)
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
        return $this->model->where('price', '>=', $minPrice)
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
        $query = $this->model->with('package');

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
     * Cập nhật thứ tự tiers
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
        $totalTiers = $this->model->count();
        $activeTiers = $this->model->where('is_active', true)->count();
        $popularTiers = $this->model->where('is_popular', true)->count();

        $priceStats = $this->model->where('is_active', true)
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

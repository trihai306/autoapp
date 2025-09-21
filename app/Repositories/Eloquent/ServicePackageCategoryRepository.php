<?php

namespace App\Repositories\Eloquent;

use App\Models\ServicePackageCategory;
use App\Repositories\ServicePackageCategoryRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

class ServicePackageCategoryRepository implements ServicePackageCategoryRepositoryInterface
{
    protected $model;

    public function __construct(ServicePackageCategory $model)
    {
        $this->model = $model;
    }

    /**
     * Lấy tất cả categories
     */
    public function getAll(array $filters = []): Collection|LengthAwarePaginator
    {
        $query = $this->model->newQuery();

        // Áp dụng filters
        if (isset($filters['is_active'])) {
            $query->where('is_active', $filters['is_active']);
        }

        if (isset($filters['search'])) {
            $query->where(function ($q) use ($filters) {
                $q->where('name', 'like', '%' . $filters['search'] . '%')
                  ->orWhere('description', 'like', '%' . $filters['search'] . '%');
            });
        }

        // Sắp xếp
        $query->orderBy('sort_order')->orderBy('name');

        // Phân trang hoặc trả về collection
        if (isset($filters['per_page'])) {
            return $query->paginate($filters['per_page']);
        }

        return $query->get();
    }

    /**
     * Lấy category theo ID
     */
    public function find(int $id): ?ServicePackageCategory
    {
        return $this->model->find($id);
    }

    /**
     * Tạo category mới
     */
    public function create(array $data): ServicePackageCategory
    {
        return $this->model->create($data);
    }

    /**
     * Cập nhật category
     */
    public function update(ServicePackageCategory $category, array $data): ServicePackageCategory
    {
        $category->update($data);
        return $category->fresh();
    }

    /**
     * Xóa category
     */
    public function delete(ServicePackageCategory $category): bool
    {
        return $category->delete();
    }

    /**
     * Lấy query builder
     */
    public function query()
    {
        return $this->model->newQuery();
    }

    /**
     * Đếm số lượng categories
     */
    public function count(): int
    {
        return $this->model->count();
    }

    /**
     * Lấy categories đang hoạt động
     */
    public function getActive(): Collection
    {
        return $this->model->where('is_active', true)
                          ->orderBy('sort_order')
                          ->orderBy('name')
                          ->get();
    }

    /**
     * Lấy categories theo platform
     */
    public function getByPlatform(string $platform): Collection
    {
        return $this->model->where('is_active', true)
                          ->whereJsonContains('settings->platform', $platform)
                          ->orderBy('sort_order')
                          ->orderBy('name')
                          ->get();
    }

    /**
     * Tìm category theo slug
     */
    public function findBySlug(string $slug): ?ServicePackageCategory
    {
        return $this->model->where('slug', $slug)->first();
    }

    /**
     * Lấy categories với thống kê
     */
    public function getWithStats(): Collection
    {
        return $this->model->withCount(['packages', 'activePackages'])
                          ->orderBy('sort_order')
                          ->orderBy('name')
                          ->get();
    }

    /**
     * Lấy categories phổ biến
     */
    public function getPopular(): Collection
    {
        return $this->model->whereHas('packages', function ($query) {
            $query->where('is_popular', true)
                  ->where('is_active', true);
        })
        ->where('is_active', true)
        ->orderBy('sort_order')
        ->orderBy('name')
        ->get();
    }

    /**
     * Cập nhật thứ tự categories
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
        $totalCategories = $this->model->count();
        $activeCategories = $this->model->where('is_active', true)->count();
        $totalPackages = $this->model->withCount('packages')
                                   ->get()
                                   ->sum('packages_count');

        return [
            'total_categories' => $totalCategories,
            'active_categories' => $activeCategories,
            'inactive_categories' => $totalCategories - $activeCategories,
            'total_packages' => $totalPackages,
        ];
    }
}

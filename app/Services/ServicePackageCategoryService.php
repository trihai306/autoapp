<?php

namespace App\Services;

use App\Models\ServicePackageCategory;
use App\Repositories\ServicePackageCategoryRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

class ServicePackageCategoryService
{
    protected $repository;

    public function __construct(ServicePackageCategoryRepositoryInterface $repository)
    {
        $this->repository = $repository;
    }

    /**
     * Lấy tất cả categories
     */
    public function getAll(array $filters = []): LengthAwarePaginator|Collection
    {
        $query = $this->repository->query();

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
    public function getById(int $id): ?ServicePackageCategory
    {
        return $this->repository->find($id);
    }

    /**
     * Tạo category mới
     */
    public function create(array $data): ServicePackageCategory
    {
        return $this->repository->create($data);
    }

    /**
     * Cập nhật category
     */
    public function update(int $id, array $data): ?ServicePackageCategory
    {
        $category = $this->repository->find($id);
        
        if (!$category) {
            return null;
        }

        return $this->repository->update($category, $data);
    }

    /**
     * Xóa category
     */
    public function delete(int $id): bool
    {
        $category = $this->repository->find($id);
        
        if (!$category) {
            return false;
        }

        return $this->repository->delete($category);
    }

    /**
     * Lấy packages của category
     */
    public function getPackages(int $categoryId): Collection
    {
        $category = $this->repository->find($categoryId);
        
        if (!$category) {
            return collect();
        }

        return $category->activePackages()->get();
    }

    /**
     * Lấy packages với tiers
     */
    public function getPackagesWithTiers(int $categoryId): Collection
    {
        $category = $this->repository->find($categoryId);
        
        if (!$category) {
            return collect();
        }

        return $category->packagesWithTiers();
    }

    /**
     * Lấy packages theo platform
     */
    public function getPackagesByPlatform(int $categoryId, string $platform): Collection
    {
        $category = $this->repository->find($categoryId);
        
        if (!$category) {
            return collect();
        }

        return $category->packagesByPlatform($platform);
    }

    /**
     * Lấy packages theo duration type
     */
    public function getPackagesByDuration(int $categoryId, string $durationType): Collection
    {
        $category = $this->repository->find($categoryId);
        
        if (!$category) {
            return collect();
        }

        return $category->packagesByDuration($durationType);
    }

    /**
     * Lấy categories với thống kê
     */
    public function getWithStats(): Collection
    {
        return $this->repository->query()
            ->withCount(['packages', 'activePackages'])
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get();
    }

    /**
     * Lấy categories phổ biến
     */
    public function getPopular(): Collection
    {
        return $this->repository->query()
            ->whereHas('packages', function ($query) {
                $query->where('is_popular', true)
                      ->where('is_active', true);
            })
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get();
    }

    /**
     * Kích hoạt/vô hiệu hóa category
     */
    public function toggleActive(int $id): ?ServicePackageCategory
    {
        $category = $this->repository->find($id);
        
        if (!$category) {
            return null;
        }

        $category->update(['is_active' => !$category->is_active]);
        
        return $category;
    }

    /**
     * Cập nhật thứ tự categories
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
        $totalCategories = $this->repository->count();
        $activeCategories = $this->repository->query()->where('is_active', true)->count();
        $totalPackages = $this->repository->query()
            ->withCount('packages')
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

<?php

namespace App\Repositories;

use App\Models\ServicePackageCategory;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

interface ServicePackageCategoryRepositoryInterface
{
    /**
     * Lấy tất cả categories
     */
    public function getAll(array $filters = []): Collection|LengthAwarePaginator;

    /**
     * Lấy category theo ID
     */
    public function find(int $id): ?ServicePackageCategory;

    /**
     * Tạo category mới
     */
    public function create(array $data): ServicePackageCategory;

    /**
     * Cập nhật category
     */
    public function update(ServicePackageCategory $category, array $data): ServicePackageCategory;

    /**
     * Xóa category
     */
    public function delete(ServicePackageCategory $category): bool;

    /**
     * Lấy query builder
     */
    public function query();

    /**
     * Đếm số lượng categories
     */
    public function count(): int;

    /**
     * Lấy categories đang hoạt động
     */
    public function getActive(): Collection;

    /**
     * Lấy categories theo platform
     */
    public function getByPlatform(string $platform): Collection;

    /**
     * Tìm category theo slug
     */
    public function findBySlug(string $slug): ?ServicePackageCategory;

    /**
     * Lấy categories với thống kê
     */
    public function getWithStats(): Collection;

    /**
     * Lấy categories phổ biến
     */
    public function getPopular(): Collection;

    /**
     * Cập nhật thứ tự categories
     */
    public function updateSortOrder(array $sortData): bool;

    /**
     * Lấy thống kê tổng quan
     */
    public function getOverviewStats(): array;
}

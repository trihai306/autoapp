<?php

namespace App\Repositories;

use App\Models\ServicePackage;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

interface ServicePackageRepositoryInterface
{
    /**
     * Lấy tất cả packages
     */
    public function getAll(array $filters = []): Collection|LengthAwarePaginator;

    /**
     * Lấy package theo ID
     */
    public function find(int $id): ?ServicePackage;

    /**
     * Tạo package mới
     */
    public function create(array $data): ServicePackage;

    /**
     * Cập nhật package
     */
    public function update(ServicePackage $package, array $data): ServicePackage;

    /**
     * Xóa package
     */
    public function delete(ServicePackage $package): bool;

    /**
     * Lấy query builder
     */
    public function query();

    /**
     * Đếm số lượng packages
     */
    public function count(): int;

    /**
     * Lấy packages đang hoạt động
     */
    public function getActive(): Collection;

    /**
     * Lấy packages theo category
     */
    public function getByCategory(int $categoryId): Collection;

    /**
     * Lấy packages theo platform
     */
    public function getByPlatform(string $platform): Collection;

    /**
     * Lấy packages theo duration type
     */
    public function getByDurationType(string $durationType): Collection;

    /**
     * Lấy packages với tiers
     */
    public function getAllWithTiers(array $filters = []): Collection;

    /**
     * Lấy packages phổ biến
     */
    public function getPopular(): Collection;

    /**
     * Lấy packages theo khoảng giá tiers
     */
    public function getByTierPriceRange(float $minPrice, float $maxPrice): Collection;

    /**
     * Lấy packages với thông tin category
     */
    public function getWithCategory(array $filters = []): Collection;

    /**
     * Cập nhật thứ tự packages
     */
    public function updateSortOrder(array $sortData): bool;

    /**
     * Lấy thống kê tổng quan
     */
    public function getOverviewStats(): array;
}

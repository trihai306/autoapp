<?php

namespace App\Repositories;

use App\Models\ServicePackageTier;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

interface ServicePackageTierRepositoryInterface
{
    /**
     * Lấy tất cả tiers
     */
    public function getAll(array $filters = []): Collection|LengthAwarePaginator;

    /**
     * Lấy tier theo ID
     */
    public function find(int $id): ?ServicePackageTier;

    /**
     * Tạo tier mới
     */
    public function create(array $data): ServicePackageTier;

    /**
     * Cập nhật tier
     */
    public function update(ServicePackageTier $tier, array $data): ServicePackageTier;

    /**
     * Xóa tier
     */
    public function delete(ServicePackageTier $tier): bool;

    /**
     * Lấy query builder
     */
    public function query();

    /**
     * Đếm số lượng tiers
     */
    public function count(): int;

    /**
     * Lấy tiers đang hoạt động
     */
    public function getActive(): Collection;

    /**
     * Lấy tiers theo package
     */
    public function getByPackage(int $packageId): Collection;

    /**
     * Lấy tiers theo số lượng thiết bị
     */
    public function getByDeviceLimit(int $deviceLimit): Collection;

    /**
     * Lấy tiers phổ biến
     */
    public function getPopular(): Collection;

    /**
     * Lấy tiers theo khoảng giá
     */
    public function getByPriceRange(float $minPrice, float $maxPrice): Collection;

    /**
     * Lấy tiers với thông tin package
     */
    public function getWithPackage(array $filters = []): Collection;

    /**
     * Cập nhật thứ tự tiers
     */
    public function updateSortOrder(array $sortData): bool;

    /**
     * Lấy thống kê tổng quan
     */
    public function getOverviewStats(): array;
}

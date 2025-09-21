<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class ServicePackageCategory extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'icon',
        'color',
        'is_active',
        'sort_order',
        'settings',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'sort_order' => 'integer',
        'settings' => 'array',
    ];

    /**
     * Boot method để tự động tạo slug
     */
    protected static function boot(): void
    {
        parent::boot();

        static::creating(function ($category) {
            if (empty($category->slug)) {
                $category->slug = Str::slug($category->name);
            }
        });

        static::updating(function ($category) {
            if ($category->isDirty('name') && empty($category->slug)) {
                $category->slug = Str::slug($category->name);
            }
        });
    }

    /**
     * Relationship với ServicePackage
     */
    public function packages(): HasMany
    {
        return $this->hasMany(ServicePackage::class, 'category_id');
    }

    /**
     * Relationship với active ServicePackage
     */
    public function activePackages(): HasMany
    {
        return $this->hasMany(ServicePackage::class, 'category_id')
                    ->where('is_active', true);
    }

    /**
     * Scope để lấy các category đang hoạt động
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope để sắp xếp theo thứ tự
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order')->orderBy('name');
    }

    /**
     * Lấy tất cả packages với tiers
     */
    public function packagesWithTiers()
    {
        return $this->packages()
                    ->with(['tiers' => function($query) {
                        $query->where('is_active', true)
                              ->orderBy('sort_order')
                              ->orderBy('device_limit');
                    }])
                    ->where('is_active', true)
                    ->orderBy('duration_value');
    }

    /**
     * Lấy packages theo duration type
     */
    public function packagesByDuration($durationType = 'months')
    {
        return $this->packages()
                    ->where('duration_type', $durationType)
                    ->where('is_active', true)
                    ->orderBy('duration_value');
    }

    /**
     * Lấy packages theo platform
     */
    public function packagesByPlatform($platform)
    {
        return $this->packages()
                    ->where('platform', $platform)
                    ->where('is_active', true)
                    ->orderBy('duration_value');
    }

    /**
     * Kiểm tra xem category có packages không
     */
    public function hasPackages(): bool
    {
        return $this->packages()->exists();
    }

    /**
     * Kiểm tra xem category có active packages không
     */
    public function hasActivePackages(): bool
    {
        return $this->activePackages()->exists();
    }

    /**
     * Lấy số lượng packages
     */
    public function getPackagesCountAttribute(): int
    {
        return $this->packages()->count();
    }

    /**
     * Lấy số lượng active packages
     */
    public function getActivePackagesCountAttribute(): int
    {
        return $this->activePackages()->count();
    }
}
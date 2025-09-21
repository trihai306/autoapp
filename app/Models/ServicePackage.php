<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class ServicePackage extends Model
{
    use HasFactory;

    protected $fillable = [
        'category_id',
        'name',
        'slug',
        'description',
        'duration_type',
        'duration_value',
        'platform',
        'platform_settings',
        'is_active',
        'is_popular',
        'sort_order',
        'features',
        'limits',
        'icon',
        'color',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'is_popular' => 'boolean',
        'sort_order' => 'integer',
        'duration_value' => 'integer',
        'features' => 'array',
        'limits' => 'array',
        'platform_settings' => 'array',
    ];

    /**
     * Boot method để tự động tạo slug
     */
    protected static function boot(): void
    {
        parent::boot();

        static::creating(function ($package) {
            if (empty($package->slug)) {
                $package->slug = Str::slug($package->name);
            }
        });

        static::updating(function ($package) {
            if ($package->isDirty('name') && empty($package->slug)) {
                $package->slug = Str::slug($package->name);
            }
        });
    }

    /**
     * Relationship với ServicePackageCategory
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(ServicePackageCategory::class, 'category_id');
    }

    /**
     * Relationship với ServicePackageTier
     */
    public function tiers(): HasMany
    {
        return $this->hasMany(ServicePackageTier::class);
    }

    /**
     * Relationship với active ServicePackageTier
     */
    public function activeTiers(): HasMany
    {
        return $this->hasMany(ServicePackageTier::class)
                    ->where('is_active', true)
                    ->orderBy('sort_order')
                    ->orderBy('device_limit');
    }

    /**
     * Relationship với ServicePackageFeature (giữ lại cho backward compatibility)
     */
    public function features(): HasMany
    {
        return $this->hasMany(ServicePackageFeature::class)->orderBy('sort_order');
    }

    /**
     * Relationship với UserServicePackage (subscriptions)
     */
    public function userSubscriptions(): HasMany
    {
        return $this->hasMany(UserServicePackage::class);
    }

    /**
     * Relationship với active UserServicePackage subscriptions
     */
    public function activeSubscriptions(): HasMany
    {
        return $this->hasMany(UserServicePackage::class)
                    ->where('status', UserServicePackage::STATUS_ACTIVE)
                    ->where('expires_at', '>', now());
    }

    /**
     * Scope để lấy các package đang hoạt động
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope để lấy các package phổ biến
     */
    public function scopePopular($query)
    {
        return $query->where('is_popular', true);
    }

    /**
     * Scope để sắp xếp theo thứ tự
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order')->orderBy('duration_value');
    }

    /**
     * Scope để lấy package theo category
     */
    public function scopeByCategory($query, $categoryId)
    {
        return $query->where('category_id', $categoryId);
    }

    /**
     * Scope để lấy package theo platform
     */
    public function scopeByPlatform($query, $platform)
    {
        return $query->where('platform', $platform);
    }

    /**
     * Scope để lấy package theo duration type
     */
    public function scopeByDurationType($query, $durationType)
    {
        return $query->where('duration_type', $durationType);
    }

    /**
     * Lấy thời hạn sử dụng dưới dạng chuỗi
     */
    public function getDurationAttribute(): string
    {
        if ($this->duration_type === 'years') {
            return $this->duration_value . ' năm';
        }
        
        if ($this->duration_type === 'months') {
            return $this->duration_value . ' tháng';
        }
        
        if ($this->duration_type === 'days') {
            return $this->duration_value . ' ngày';
        }
        
        return 'Không giới hạn';
    }

    /**
     * Lấy thời hạn sử dụng dưới dạng số ngày
     */
    public function getDurationInDaysAttribute(): int
    {
        if ($this->duration_type === 'years') {
            return $this->duration_value * 365;
        }
        
        if ($this->duration_type === 'months') {
            return $this->duration_value * 30;
        }
        
        if ($this->duration_type === 'days') {
            return $this->duration_value;
        }
        
        return 0;
    }

    /**
     * Lấy giá thấp nhất từ các tiers
     */
    public function getMinPriceAttribute(): ?float
    {
        return $this->activeTiers()->min('price');
    }

    /**
     * Lấy giá cao nhất từ các tiers
     */
    public function getMaxPriceAttribute(): ?float
    {
        return $this->activeTiers()->max('price');
    }

    /**
     * Lấy giá đã format thấp nhất
     */
    public function getFormattedMinPriceAttribute(): string
    {
        $minPrice = $this->min_price;
        if (!$minPrice) {
            return 'Liên hệ';
        }
        
        return number_format($minPrice, 0, ',', '.') . ' VND';
    }

    /**
     * Lấy số lượng tiers
     */
    public function getTiersCountAttribute(): int
    {
        return $this->tiers()->count();
    }

    /**
     * Lấy số lượng active tiers
     */
    public function getActiveTiersCountAttribute(): int
    {
        return $this->activeTiers()->count();
    }

    /**
     * Lấy tier phổ biến nhất
     */
    public function getPopularTierAttribute(): ?ServicePackageTier
    {
        return $this->activeTiers()->where('is_popular', true)->first();
    }

    /**
     * Lấy tier theo số lượng thiết bị
     */
    public function getTierByDeviceLimit(int $deviceLimit): ?ServicePackageTier
    {
        return $this->activeTiers()
                    ->where('device_limit', '>=', $deviceLimit)
                    ->orderBy('device_limit')
                    ->first();
    }

    /**
     * Kiểm tra xem package có tiers không
     */
    public function hasTiers(): bool
    {
        return $this->tiers()->exists();
    }

    /**
     * Kiểm tra xem package có active tiers không
     */
    public function hasActiveTiers(): bool
    {
        return $this->activeTiers()->exists();
    }

    /**
     * Kiểm tra xem package có thời hạn không
     */
    public function hasDuration(): bool
    {
        return $this->duration_value > 0;
    }

    /**
     * Lấy thông tin package đầy đủ với tiers
     */
    public function getFullInfoAttribute(): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'description' => $this->description,
            'duration' => $this->duration,
            'duration_in_days' => $this->duration_in_days,
            'platform' => $this->platform,
            'platform_settings' => $this->platform_settings,
            'is_active' => $this->is_active,
            'is_popular' => $this->is_popular,
            'min_price' => $this->min_price,
            'max_price' => $this->max_price,
            'formatted_min_price' => $this->formatted_min_price,
            'tiers_count' => $this->tiers_count,
            'active_tiers_count' => $this->active_tiers_count,
            'category' => $this->category,
            'tiers' => $this->activeTiers->map->full_info,
        ];
    }
}
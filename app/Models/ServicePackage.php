<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class ServicePackage extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'price',
        'currency',
        'duration_days',
        'duration_months',
        'duration_years',
        'is_active',
        'is_popular',
        'sort_order',
        'features',
        'limits',
        'icon',
        'color',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'is_active' => 'boolean',
        'is_popular' => 'boolean',
        'features' => 'array',
        'limits' => 'array',
        'duration_days' => 'integer',
        'duration_months' => 'integer',
        'duration_years' => 'integer',
        'sort_order' => 'integer',
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
     * Relationship với ServicePackageFeature
     */
    public function features(): HasMany
    {
        return $this->hasMany(ServicePackageFeature::class)->orderBy('sort_order');
    }

    /**
     * Scope để lấy các gói đang hoạt động
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope để lấy các gói phổ biến
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
        return $query->orderBy('sort_order')->orderBy('price');
    }

    /**
     * Lấy thời hạn sử dụng dưới dạng chuỗi
     */
    public function getDurationAttribute(): string
    {
        if ($this->duration_years) {
            return $this->duration_years . ' năm';
        }
        
        if ($this->duration_months) {
            return $this->duration_months . ' tháng';
        }
        
        if ($this->duration_days) {
            return $this->duration_days . ' ngày';
        }
        
        return 'Không giới hạn';
    }

    /**
     * Lấy giá đã format
     */
    public function getFormattedPriceAttribute(): string
    {
        return number_format($this->price, 0, ',', '.') . ' ' . $this->currency;
    }

    /**
     * Kiểm tra xem gói có phải là gói miễn phí không
     */
    public function isFree(): bool
    {
        return $this->price == 0;
    }

    /**
     * Kiểm tra xem gói có thời hạn không
     */
    public function hasDuration(): bool
    {
        return $this->duration_days || $this->duration_months || $this->duration_years;
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class ServicePackageTier extends Model
{
    use HasFactory;

    protected $fillable = [
        'service_package_id',
        'name',
        'slug',
        'description',
        'device_limit',
        'price',
        'currency',
        'is_popular',
        'is_active',
        'sort_order',
        'features',
        'limits',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'is_popular' => 'boolean',
        'is_active' => 'boolean',
        'sort_order' => 'integer',
        'features' => 'array',
        'limits' => 'array',
    ];

    /**
     * Boot method để tự động tạo slug
     */
    protected static function boot(): void
    {
        parent::boot();

        static::creating(function ($tier) {
            if (empty($tier->slug)) {
                $tier->slug = Str::slug($tier->name);
            }
        });

        static::updating(function ($tier) {
            if ($tier->isDirty('name') && empty($tier->slug)) {
                $tier->slug = Str::slug($tier->name);
            }
        });
    }

    /**
     * Relationship với ServicePackage
     */
    public function package(): BelongsTo
    {
        return $this->belongsTo(ServicePackage::class);
    }

    /**
     * Relationship với UserServicePackage (subscriptions)
     */
    public function userSubscriptions(): HasMany
    {
        return $this->hasMany(UserServicePackage::class, 'tier_id');
    }

    /**
     * Relationship với active UserServicePackage subscriptions
     */
    public function activeSubscriptions(): HasMany
    {
        return $this->hasMany(UserServicePackage::class, 'tier_id')
                    ->where('status', UserServicePackage::STATUS_ACTIVE)
                    ->where('expires_at', '>', now());
    }

    /**
     * Scope để lấy các tier đang hoạt động
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope để lấy các tier phổ biến
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
        return $query->orderBy('sort_order')->orderBy('device_limit');
    }

    /**
     * Scope để lấy tier theo số lượng thiết bị
     */
    public function scopeByDeviceLimit($query, int $deviceLimit)
    {
        return $query->where('device_limit', '>=', $deviceLimit)
                    ->where('is_active', true)
                    ->orderBy('device_limit');
    }

    /**
     * Lấy giá đã format
     */
    public function getFormattedPriceAttribute(): string
    {
        return number_format($this->price, 0, ',', '.') . ' ' . $this->currency;
    }

    /**
     * Lấy thông tin device limit
     */
    public function getDeviceLimitTextAttribute(): string
    {
        if ($this->device_limit == -1) {
            return 'Không giới hạn';
        }
        
        return $this->device_limit . ' thiết bị';
    }

    /**
     * Kiểm tra xem tier có phải là tier miễn phí không
     */
    public function isFree(): bool
    {
        return $this->price == 0;
    }

    /**
     * Kiểm tra xem tier có giới hạn thiết bị không
     */
    public function hasDeviceLimit(): bool
    {
        return $this->device_limit > 0;
    }

    /**
     * Kiểm tra xem tier có không giới hạn thiết bị không
     */
    public function isUnlimitedDevices(): bool
    {
        return $this->device_limit == -1;
    }

    /**
     * Lấy giá theo package duration
     */
    public function getPriceForDuration(): float
    {
        $package = $this->package;
        if (!$package) {
            return $this->price;
        }

        // Tính giá theo duration của package
        $multiplier = 1;
        if ($package->duration_type === 'months') {
            $multiplier = $package->duration_value;
        } elseif ($package->duration_type === 'years') {
            $multiplier = $package->duration_value * 12;
        }

        return $this->price * $multiplier;
    }

    /**
     * Lấy giá đã format theo duration
     */
    public function getFormattedPriceForDurationAttribute(): string
    {
        $price = $this->getPriceForDuration();
        return number_format($price, 0, ',', '.') . ' ' . $this->currency;
    }

    /**
     * Lấy thông tin tier đầy đủ
     */
    public function getFullInfoAttribute(): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'description' => $this->description,
            'device_limit' => $this->device_limit,
            'device_limit_text' => $this->device_limit_text,
            'price' => $this->price,
            'formatted_price' => $this->formatted_price,
            'price_for_duration' => $this->getPriceForDuration(),
            'formatted_price_for_duration' => $this->formatted_price_for_duration,
            'currency' => $this->currency,
            'is_popular' => $this->is_popular,
            'is_active' => $this->is_active,
            'features' => $this->features,
            'limits' => $this->limits,
        ];
    }
}
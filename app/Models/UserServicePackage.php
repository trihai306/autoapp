<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Carbon\Carbon;

class UserServicePackage extends Model
{
    use HasFactory;

    protected $table = 'user_service_packages';

    protected $fillable = [
        'user_id',
        'service_package_id',
        'tier_id',
        'status',
        'started_at',
        'expires_at',
        'amount_paid',
        'currency',
        'payment_method',
        'transaction_id',
        'notes',
    ];

    protected $casts = [
        'started_at' => 'datetime',
        'expires_at' => 'datetime',
        'amount_paid' => 'decimal:2',
    ];

    /**
     * Status constants
     */
    const STATUS_ACTIVE = 'active';
    const STATUS_EXPIRED = 'expired';
    const STATUS_CANCELLED = 'cancelled';
    const STATUS_PENDING = 'pending';

    /**
     * Relationship với User
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Relationship với ServicePackage
     */
    public function servicePackage(): BelongsTo
    {
        return $this->belongsTo(ServicePackage::class);
    }

    /**
     * Relationship với ServicePackageTier
     */
    public function tier(): BelongsTo
    {
        return $this->belongsTo(ServicePackageTier::class, 'tier_id');
    }

    /**
     * Relationship với Transaction
     */
    public function transaction(): BelongsTo
    {
        return $this->belongsTo(Transaction::class);
    }

    /**
     * Scope để lấy các subscription đang hoạt động
     */
    public function scopeActive($query)
    {
        return $query->where('status', self::STATUS_ACTIVE)
                    ->where('expires_at', '>', now());
    }

    /**
     * Scope để lấy các subscription đã hết hạn
     */
    public function scopeExpired($query)
    {
        return $query->where(function ($q) {
            $q->where('status', self::STATUS_EXPIRED)
              ->orWhere('expires_at', '<=', now());
        });
    }

    /**
     * Scope để lấy các subscription của user
     */
    public function scopeForUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Kiểm tra xem subscription có đang hoạt động không
     */
    public function isActive(): bool
    {
        return $this->status === self::STATUS_ACTIVE && 
               $this->expires_at && 
               $this->expires_at->isFuture();
    }

    /**
     * Kiểm tra xem subscription có hết hạn không
     */
    public function isExpired(): bool
    {
        return $this->expires_at && $this->expires_at->isPast();
    }

    /**
     * Lấy số ngày còn lại
     */
    public function getDaysRemainingAttribute(): int
    {
        if (!$this->expires_at) {
            return 0;
        }

        return max(0, now()->diffInDays($this->expires_at, false));
    }

    /**
     * Lấy phần trăm thời gian còn lại
     */
    public function getRemainingPercentageAttribute(): float
    {
        if (!$this->started_at || !$this->expires_at) {
            return 0;
        }

        $totalDays = $this->started_at->diffInDays($this->expires_at);
        $remainingDays = $this->days_remaining;

        if ($totalDays <= 0) {
            return 0;
        }

        return ($remainingDays / $totalDays) * 100;
    }

    /**
     * Tự động cập nhật status khi hết hạn
     */
    public function updateStatusIfExpired(): void
    {
        if ($this->isExpired() && $this->status === self::STATUS_ACTIVE) {
            $this->update(['status' => self::STATUS_EXPIRED]);
        }
    }

    /**
     * Tạo subscription mới
     */
    public static function createSubscription(
        int $userId,
        int $servicePackageId,
        float $amountPaid,
        string $currency = 'VND',
        $transactionId = null,
        ?string $paymentMethod = null,
        $tierId = null
    ): self {
        $package = ServicePackage::findOrFail($servicePackageId);
        $now = now();
        
        // Tính thời gian hết hạn
        $expiresAt = $now->copy();
        if ($package->duration_type === 'days') {
            $expiresAt->addDays($package->duration_value);
        } elseif ($package->duration_type === 'months') {
            $expiresAt->addMonths($package->duration_value);
        } elseif ($package->duration_type === 'years') {
            $expiresAt->addYears($package->duration_value);
        } else {
            // Không giới hạn thời gian
            $expiresAt = null;
        }

        return self::create([
            'user_id' => $userId,
            'service_package_id' => $servicePackageId,
            'tier_id' => $tierId,
            'status' => self::STATUS_ACTIVE,
            'started_at' => $now,
            'expires_at' => $expiresAt,
            'amount_paid' => $amountPaid,
            'currency' => $currency,
            'payment_method' => $paymentMethod,
            'transaction_id' => $transactionId,
        ]);
    }

    /**
     * Gia hạn subscription
     */
    public function extendSubscription(int $days = null, int $months = null, int $years = null): void
    {
        if (!$this->expires_at) {
            return; // Không thể gia hạn gói không giới hạn
        }

        $newExpiresAt = $this->expires_at->copy();
        
        if ($days) {
            $newExpiresAt->addDays($days);
        } elseif ($months) {
            $newExpiresAt->addMonths($months);
        } elseif ($years) {
            $newExpiresAt->addYears($years);
        } else {
            // Gia hạn theo thời gian của gói
            $package = $this->servicePackage;
            if ($package->duration_type === 'days') {
                $newExpiresAt->addDays($package->duration_value);
            } elseif ($package->duration_type === 'months') {
                $newExpiresAt->addMonths($package->duration_value);
            } elseif ($package->duration_type === 'years') {
                $newExpiresAt->addYears($package->duration_value);
            }
        }

        $this->update([
            'expires_at' => $newExpiresAt,
            'status' => self::STATUS_ACTIVE,
        ]);
    }
}

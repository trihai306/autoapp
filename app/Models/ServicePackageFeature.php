<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ServicePackageFeature extends Model
{
    use HasFactory;

    protected $fillable = [
        'service_package_id',
        'name',
        'description',
        'type',
        'value',
        'unit',
        'is_included',
        'sort_order',
        'icon',
    ];

    protected $casts = [
        'is_included' => 'boolean',
        'sort_order' => 'integer',
    ];

    /**
     * Relationship với ServicePackage
     */
    public function servicePackage(): BelongsTo
    {
        return $this->belongsTo(ServicePackage::class);
    }

    /**
     * Scope để lấy các tính năng được bao gồm
     */
    public function scopeIncluded($query)
    {
        return $query->where('is_included', true);
    }

    /**
     * Scope để lấy các tính năng theo loại
     */
    public function scopeOfType($query, string $type)
    {
        return $query->where('type', $type);
    }

    /**
     * Scope để sắp xếp theo thứ tự
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order')->orderBy('name');
    }

    /**
     * Lấy giá trị hiển thị
     */
    public function getDisplayValueAttribute(): string
    {
        if ($this->value === 'unlimited' || $this->value === '∞') {
            return 'Không giới hạn';
        }

        if ($this->value && $this->unit) {
            return $this->value . ' ' . $this->unit;
        }

        return $this->value ?? '';
    }

    /**
     * Kiểm tra xem tính năng có giới hạn không
     */
    public function isUnlimited(): bool
    {
        return in_array($this->value, ['unlimited', '∞', null]);
    }

    /**
     * Kiểm tra xem tính năng có giá trị số không
     */
    public function hasNumericValue(): bool
    {
        return is_numeric($this->value);
    }

    /**
     * Lấy giá trị số
     */
    public function getNumericValue(): ?float
    {
        return $this->hasNumericValue() ? (float) $this->value : null;
    }
}

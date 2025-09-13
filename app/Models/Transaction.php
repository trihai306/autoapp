<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Transaction extends Model
{
    use HasFactory;

    /**
     * The fields that are searchable.
     *
     * @var array
     */
    public $searchable = ['description', 'type'];

    /**
     * The fields that are filterable.
     *
     * @var array
     */
    public $filterable = ['type', 'user_id', 'status'];

    /**
     * The fields that are sortable.
     *
     * @var array
     */
    public $sortable = ['amount', 'created_at', 'status', 'type'];

    protected $fillable = [
        'user_id',
        'type',
        'amount',
        'currency',
        'status',
        'description',
        'reference_id',
        'reference_type',
        'metadata',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'metadata' => 'array',
    ];

    /**
     * Get the user that owns the transaction.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the related model (polymorphic relationship)
     */
    public function reference()
    {
        return $this->morphTo('reference');
    }

    /**
     * Scope for completed transactions
     */
    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    /**
     * Scope for pending transactions
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * Scope for failed transactions
     */
    public function scopeFailed($query)
    {
        return $query->where('status', 'failed');
    }

    /**
     * Scope for service package purchases
     */
    public function scopeServicePackagePurchases($query)
    {
        return $query->where('type', 'service_package_purchase');
    }

    /**
     * Scope for service package extensions
     */
    public function scopeServicePackageExtensions($query)
    {
        return $query->where('type', 'service_package_extension');
    }
}

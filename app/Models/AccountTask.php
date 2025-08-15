<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Builder;

class AccountTask extends Model
{
    use HasFactory;

    protected $table = 'account_tasks';

    protected $fillable = [
        'tiktok_account_id',
        'interaction_scenario_id',
        'device_id',
        'task_type',
        'parameters',
        'priority',
        'status',
        'result',
        'error_message',
        'retry_count',
        'max_retries',
        'scheduled_at',
        'started_at',
        'completed_at',
    ];

    protected $casts = [
        'parameters' => 'json',
        'result' => 'json',
        'scheduled_at' => 'datetime',
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    public $searchable = [
        'task_type',
        'error_message',
        'status',
        'priority',
    ];

    public $filterable = [
        'tiktok_account_id',
        'interaction_scenario_id',
        'device_id',
        'task_type',
        'status',
        'priority',
    ];

    public $sortable = [
        'id',
        'priority',
        'status',
        'scheduled_at',
        'started_at',
        'completed_at',
        'created_at',
        'updated_at',
    ];

    /**
     * Scope để lọc các task đang chờ (pending)
     */
    public function scopePending(Builder $query): Builder
    {
        return $query->where('status', 'pending');
    }

    /**
     * Scope để lọc các task đã được lên lịch (scheduled_at null hoặc <= now)
     */
    public function scopeScheduled(Builder $query): Builder
    {
        return $query->where(function ($q) {
            $q->whereNull('scheduled_at')
              ->orWhere('scheduled_at', '<=', now());
        });
    }

    /**
     * Bắt đầu thực hiện task
     */
    public function start(): void
    {
        $this->update([
            'status' => 'running',
            'started_at' => now(),
        ]);
    }

    /**
     * Hoàn thành task
     */
    public function complete(?array $result = null): void
    {
        $this->update([
            'status' => 'completed',
            'result' => $result,
            'completed_at' => now(),
        ]);
    }

    /**
     * Task thất bại
     */
    public function fail(string $errorMessage = ''): void
    {
        $this->update([
            'status' => 'failed',
            'error_message' => $errorMessage,
            'completed_at' => now(),
        ]);
    }

    public function tiktokAccount(): BelongsTo
    {
        return $this->belongsTo(TiktokAccount::class);
    }

    public function interactionScenario(): BelongsTo
    {
        return $this->belongsTo(InteractionScenario::class);
    }

    public function device(): BelongsTo
    {
        return $this->belongsTo(Device::class);
    }

    /**
     * Relationship với tài khoản TikTok
     */
    public function account(): BelongsTo
    {
        return $this->belongsTo(TiktokAccount::class, 'tiktok_account_id');
    }

    /**
     * Relationship với interaction scenario
     */
    public function scenario(): BelongsTo
    {
        return $this->belongsTo(InteractionScenario::class, 'interaction_scenario_id');
    }
}

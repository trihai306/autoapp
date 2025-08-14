<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

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
}

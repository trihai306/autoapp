<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class InteractionScenario extends Model
{
    use HasFactory;

    protected $table = 'interaction_scenarios';

    protected $fillable = [
        'user_id',
        'name',
        'description',
        'shuffle_actions',
        'run_count',
        'from_count',
        'to_count',
        'status',
        'total_interactions',
        'execution_count',
        'last_executed_at',
        'settings',
    ];

    protected $casts = [
        'shuffle_actions' => 'boolean',
        'run_count' => 'boolean',
        'last_executed_at' => 'datetime',
        'settings' => 'json',
    ];

    public $filterable = [
        'user_id',
        'name',
        'status',
        'shuffle_actions',
        'run_count',
    ];

    public $searchable = [
        'name',
        'description',
    ];

    public $sortable = [
        'id',
        'name',
        'status',
        'created_at',
        'updated_at',
        'last_executed_at',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function scripts(): HasMany
    {
        return $this->hasMany(ScenarioScript::class, 'scenario_id')->orderBy('order');
    }

    public function accountTasks(): HasMany
    {
        return $this->hasMany(AccountTask::class);
    }
}

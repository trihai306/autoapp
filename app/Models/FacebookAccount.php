<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FacebookAccount extends Model
{
    use HasFactory;

    protected $table = 'facebook_accounts';

    protected $fillable = [
        'username',
        'name',
        'email',
        'password',
        'status',
        'device_id',
        'proxy_id',
        'scenario_id',
        'follower_count',
        'heart_count',
        'video_count',
        'estimated_views',
        'two_factor_enabled',
        'two_factor_backup_codes',
        'connection_type',
        'notes',
        'device_info',
        'last_activity',
        'user_id',
        'phone_number',
    ];

    protected $casts = [
        'two_factor_enabled' => 'boolean',
        'two_factor_backup_codes' => 'array',
        'follower_count' => 'integer',
        'heart_count' => 'integer',
        'video_count' => 'integer',
        'estimated_views' => 'integer',
    ];

    protected $searchable = [
        'username',
        'name',
        'email',
    ];

    protected $filterable = [
        'user_id',
        'status',
        'device_id',
        'proxy_id',
        'scenario_id',
        'connection_type',
    ];

    protected $sortable = [
        'id',
        'username',
        'name',
        'email',
        'status',
        'created_at',
        'updated_at',
        'last_activity',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function proxy()
    {
        return $this->belongsTo(Proxy::class);
    }

    public function device()
    {
        return $this->belongsTo(Device::class);
    }

    public function interactionScenario()
    {
        return $this->belongsTo(InteractionScenario::class, 'scenario_id');
    }

    public function accountTasks()
    {
        return $this->hasMany(AccountTask::class, 'facebook_account_id');
    }

    public function pendingTasks()
    {
        return $this->hasMany(AccountTask::class, 'facebook_account_id')->where('status', 'pending');
    }

    public function runningTasks()
    {
        return $this->hasMany(AccountTask::class, 'facebook_account_id')->where('status', 'running');
    }
}



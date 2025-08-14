<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TiktokAccount extends Model
{
    use HasFactory;

    protected $table = 'tiktok_accounts';

    protected $fillable = [
        'user_id',
        'username',
        'email',
        'password',
        'phone_number',
        'nickname',
        'avatar_url',
        'follower_count',
        'following_count',
        'heart_count',
        'video_count',
        'bio_signature',
        'status',
        'notes',
        'proxy_id',
        'device_id',
        'scenario_id',
        'two_factor_enabled',
        'two_factor_backup_codes',
        'last_login_at',
        'last_activity_at',
    ];

    protected $casts = [
        'two_factor_enabled' => 'boolean',
        'two_factor_backup_codes' => 'array',
        'last_login_at' => 'datetime',
        'last_activity_at' => 'datetime',
    ];

    public $searchable = [
        'username',
        'email',
        'nickname',
        'bio_signature',
        'phone_number',
    ];

    public $filterable = [
        'user_id',
        'status',
        'proxy_id',
        'username',
        'email',
        'phone_number',
    ];

    public $sortable = [
        'id',
        'username',
        'email',
        'follower_count',
        'following_count',
        'heart_count',
        'video_count',
        'status',
        'created_at',
        'updated_at',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // public function proxy()
    // {
    //     return $this->belongsTo(Proxy::class);
    // }

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
        return $this->hasMany(AccountTask::class);
    }

    public function pendingTasks()
    {
        return $this->hasMany(AccountTask::class)->where('status', 'pending');
    }

    public function runningTasks()
    {
        return $this->hasMany(AccountTask::class)->where('status', 'running');
    }
}

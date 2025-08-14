<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Device extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'device_name',
        'device_id',
        'serial',
        'plan',
        'is_online',
        'proxy_id',
        'note',
        'os_version',
        'device_type',
        'platform',
        'app_version',
        'ip_address',
        'user_agent',
        'status',
        'last_active_at',
        'first_login_at',
        'push_tokens',
    ];

    protected $casts = [
        'is_online' => 'boolean',
        'last_active_at' => 'datetime',
        'first_login_at' => 'datetime',
        'push_tokens' => 'json',
    ];

    public $filterable = [
        'user_id',
        'device_name',
        'device_id',
        'status',
        'is_online',
        'device_type',
        'platform',
    ];

    public $searchable = [
        'device_name',
        'device_id',
        'serial',
        'note',
    ];

    public $sortable = [
        'id',
        'device_name',
        'device_id',
        'status',
        'is_online',
        'created_at',
        'updated_at',
    ];

    /**
     * Get the user that owns the device.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the tasks associated with the device.
     */
    public function accountTasks(): HasMany
    {
        return $this->hasMany(AccountTask::class);
    }
    
    /**
     * Get the proxy associated with the device.
     */
    // public function proxy(): BelongsTo
    // {
    //     return $this->belongsTo(Proxy::class);
    // }
}

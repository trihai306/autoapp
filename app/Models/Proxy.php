<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Proxy extends Model
{
    use HasFactory;

    protected $table = 'proxies';

    protected $fillable = [
        'user_id',
        'name',
        'host',
        'port',
        'username',
        'password',
        'type', // http, https, socks4, socks5
        'status', // active, inactive, error
        'country',
        'city',
        'notes',
        'last_used_at',
        'last_tested_at',
    ];

    protected $casts = [
        'last_used_at' => 'datetime',
        'last_tested_at' => 'datetime',
    ];

    public $searchable = [
        'name',
        'host',
        'username',
        'country',
        'city',
        'notes',
    ];

    public $filterable = [
        'user_id',
        'type',
        'status',
        'country',
    ];

    public $sortable = [
        'id',
        'name',
        'host',
        'type',
        'status',
        'last_used_at',
        'created_at',
        'updated_at',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function tiktokAccounts()
    {
        return $this->hasMany(TiktokAccount::class);
    }

    public function getFullUrlAttribute()
    {
        if ($this->username && $this->password) {
            return "{$this->type}://{$this->username}:{$this->password}@{$this->host}:{$this->port}";
        }
        return "{$this->type}://{$this->host}:{$this->port}";
    }
}

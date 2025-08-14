<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;
use Illuminate\Database\Eloquent\Relations\HasMany;


class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, HasRoles;

    /**
     * The guard name for Spatie Permission
     */
    protected $guard_name = 'sanctum';

    /**
     * The fields that are searchable.
     *
     * @var array
     */
    public $searchable = ['name', 'first_name', 'last_name', 'email', 'phone_number'];

    /**
     * The fields that are filterable.
     *
     * @var array
     */
    public $filterable = ['email', 'first_name', 'last_name', 'phone_number', 'status'];

    /**
     * The fields that are sortable.
     *
     * @var array
     */
    public $sortable = ['name', 'email', 'first_name', 'last_name', 'phone_number', 'created_at'];

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'first_name',
        'last_name',
        'email',
        'phone_number',
        'password',
        'balance',
        'status',
        'login_token'
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
        'login_token',
    ];

    /**
     * The accessors to append to the model's array form.
     *
     * @var array
     */
    protected $appends = ['full_name'];


    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'login_token_expires_at' => 'datetime',
        ];
    }

    /**
     * Get the user's full name.
     *
     * @return string
     */
    public function getFullNameAttribute()
    {
        return "{$this->first_name} {$this->last_name}";
    }

    /**
     * Get the transactions for the user.
     */
    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class);
    }

    /**
     * Get the settings for the user.
     */
    public function settings(): HasMany
    {
        return $this->hasMany(Setting::class);
    }

    /**
     * Get the devices for the user.
     */
    public function devices(): HasMany
    {
        return $this->hasMany(Device::class);
    }

    /**
     * Get the interaction scenarios for the user.
     */
    public function interactionScenarios(): HasMany
    {
        return $this->hasMany(InteractionScenario::class);
    }

    /**
     * Get the content groups for the user.
     */
    public function contentGroups(): HasMany
    {
        return $this->hasMany(ContentGroup::class);
    }

    /**
     * Get the contents for the user.
     */
    public function contents(): HasMany
    {
        return $this->hasMany(Content::class);
    }

    /**
     * Check if the user has a login token.
     *
     * @return bool
     */
    public function hasLoginToken(): bool
    {
        return !empty($this->login_token);
    }

    /**
     * Generate a permanent login token for the user.
     * Only creates a new token if no token exists.
     *
     * @return string
     */
    public function generateLoginToken(): string
    {
        // If user already has a login token, return the existing one
        if ($this->hasLoginToken()) {
            return $this->login_token;
        }

        // Generate new permanent token only if no token exists
        $token = bin2hex(random_bytes(32));
        
        $this->update([
            'login_token' => $token,
        ]);

        return $token;
    }

    /**
     * Check if the login token is valid.
     *
     * @param string $token
     * @return bool
     */
    public function isValidLoginToken(string $token): bool
    {
        return $this->login_token === $token;
    }

    /**
     * Clear the login token.
     *
     * @return void
     */
    public function clearLoginToken(): void
    {
        $this->update([
            'login_token' => null,
        ]);
    }
}

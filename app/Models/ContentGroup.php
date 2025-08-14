<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ContentGroup extends Model
{
    use HasFactory;

    /**
     * The fields that are searchable.
     *
     * @var array
     */
    public $searchable = ['name'];

    /**
     * The fields that are filterable.
     *
     * @var array
     */
    public $filterable = ['user_id', 'name'];

    /**
     * The fields that are sortable.
     *
     * @var array
     */
    public $sortable = ['name', 'created_at', 'updated_at'];

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'name',
    ];

    /**
     * Get the user that owns the content group.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the contents for the content group.
     */
    public function contents(): HasMany
    {
        return $this->hasMany(Content::class);
    }
}

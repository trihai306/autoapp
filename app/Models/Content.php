<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Content extends Model
{
    use HasFactory;

    /**
     * The fields that are searchable.
     *
     * @var array
     */
    public $searchable = ['title'];

    /**
     * The fields that are filterable.
     *
     * @var array
     */
    public $filterable = ['user_id', 'content_group_id', 'title'];

    /**
     * The fields that are sortable.
     *
     * @var array
     */
    public $sortable = ['title', 'created_at', 'updated_at'];

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'content_group_id',
        'title',
        'content',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'content' => 'array',
        ];
    }

    /**
     * Get the user that owns the content.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the content group that owns the content.
     */
    public function contentGroup(): BelongsTo
    {
        return $this->belongsTo(ContentGroup::class);
    }
}

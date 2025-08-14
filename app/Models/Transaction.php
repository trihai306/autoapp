<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Transaction extends Model
{
    use HasFactory;

    /**
     * The fields that are searchable.
     *
     * @var array
     */
    public $searchable = ['description', 'type'];

    /**
     * The fields that are filterable.
     *
     * @var array
     */
    public $filterable = ['type', 'user_id', 'status'];

    /**
     * The fields that are sortable.
     *
     * @var array
     */
    public $sortable = ['amount', 'created_at', 'status', 'type'];

    protected $fillable = [
        'user_id',
        'type',
        'amount',
        'description',
        'status',
    ];

    /**
     * Get the user that owns the transaction.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}

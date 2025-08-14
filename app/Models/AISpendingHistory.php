<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AISpendingHistory extends Model
{
    use HasFactory;

    /**
     * The fields that are filterable.
     *
     * @var array
     */
    public $filterable = ['feature_name', 'model_name', 'user_id'];

    /**
     * The fields that are sortable.
     *
     * @var array
     */
    public $sortable = ['cost', 'tokens_used', 'created_at'];

    protected $fillable = [
        'user_id',
        'transaction_id',
        'feature_name',
        'model_name',
        'tokens_used',
        'cost',
        'metadata',
    ];

    protected $casts = [
        'metadata' => 'array',
        'tokens_used' => 'float',
        'cost' => 'float',
    ];

    /**
     * Get the user that owns the AI spending history.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the transaction associated with the AI spending history.
     */
    public function transaction()
    {
        return $this->belongsTo(Transaction::class);
    }
}

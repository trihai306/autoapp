<?php

namespace App\Repositories\Eloquent;

use App\Models\AISpendingHistory;
use App\Repositories\AISpendingHistoryRepositoryInterface;

class AISpendingHistoryRepository extends BaseRepository implements AISpendingHistoryRepositoryInterface
{
    /**
     * AISpendingHistoryRepository constructor.
     *
     * @param AISpendingHistory $model
     */
    public function __construct(AISpendingHistory $model)
    {
        parent::__construct($model);
    }
}

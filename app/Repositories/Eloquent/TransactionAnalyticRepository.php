<?php

namespace App\Repositories\Eloquent;

use App\Models\Transaction;
use App\Repositories\TransactionAnalyticRepositoryInterface;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class TransactionAnalyticRepository extends BaseRepository implements TransactionAnalyticRepositoryInterface
{
    /**
     * @param Transaction $model
     */
    public function __construct(Transaction $model)
    {
        parent::__construct($model);
    }

    /**
     * @param string $type
     * @param string $status
     * @param Carbon $startDate
     * @param Carbon $endDate
     * @return \Illuminate\Support\Collection
     */
    public function getTransactionDataByPeriod(string $type, string $status, Carbon $startDate, Carbon $endDate)
    {
        return $this->model->where('type', $type)
            ->where('status', $status)
            ->whereBetween('created_at', [$startDate, $endDate])
            ->select(DB::raw('DATE(created_at) as date'), DB::raw('sum(amount) as total'))
            ->groupBy('date')
            ->pluck('total', 'date');
    }
}

<?php

namespace App\Repositories;

use Illuminate\Support\Carbon;

interface TransactionAnalyticRepositoryInterface extends BaseRepositoryInterface
{
    /**
     * Get transaction data for a given period.
     *
     * @param string $type
     * @param string $status
     * @param Carbon $startDate
     * @param Carbon $endDate
     * @return \Illuminate\Support\Collection
     */
    public function getTransactionDataByPeriod(string $type, string $status, Carbon $startDate, Carbon $endDate);
}

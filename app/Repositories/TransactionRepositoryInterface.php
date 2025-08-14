<?php

namespace App\Repositories;

use App\Models\Transaction;
use Illuminate\Database\Eloquent\Collection;

interface TransactionRepositoryInterface extends BaseRepositoryInterface
{
    public function getUserTransactions(int $userId): Collection;
    public function deleteByIds(array $ids): int;
}

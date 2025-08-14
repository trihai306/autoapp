<?php

namespace App\Repositories\Eloquent;

use App\Models\Transaction;
use App\Repositories\TransactionRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;

class TransactionRepository extends BaseRepository implements TransactionRepositoryInterface
{
    public function __construct(Transaction $model)
    {
        parent::__construct($model);
    }

    public function getUserTransactions(int $userId): Collection
    {
        return $this->model->where('user_id', $userId)->latest()->get();
    }

    public function deleteByIds(array $ids): int
    {
        return $this->model->whereIn('id', $ids)->delete();
    }
}

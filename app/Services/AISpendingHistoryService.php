<?php

namespace App\Services;

use App\Models\User;
use App\Models\AISpendingHistory;
use App\Queries\BaseQuery;
use App\Repositories\AISpendingHistoryRepositoryInterface;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Throwable;

class AISpendingHistoryService
{
    protected $aiSpendingHistoryRepository;

    public function __construct(AISpendingHistoryRepositoryInterface $aiSpendingHistoryRepository)
    {
        $this->aiSpendingHistoryRepository = $aiSpendingHistoryRepository;
    }

    /**
     * @throws Throwable
     */
    public function recordUsage(array $data): AISpendingHistory
    {
        return DB::transaction(function () use ($data) {
            $user = Auth::user();
            $cost = $data['cost'];

            $historyData = array_merge($data, ['user_id' => $user->id]);
            
            $history = $this->aiSpendingHistoryRepository->create($historyData);

            if ($cost > 0) {
                app(TransactionService::class)->withdrawal($user, $cost, "AI Service: " . $data['feature_name']);
                
                $transaction = $user->transactions()->latest()->first();
                $this->aiSpendingHistoryRepository->update($history->id, ['transaction_id' => $transaction->id]);
                $history->refresh();
            }

            return $history;
        });
    }

    public function getHistory(Request $request): LengthAwarePaginator
    {
        $query = $this->aiSpendingHistoryRepository->getModel()->query()->where('user_id', Auth::id());
        return BaseQuery::for($query, $request)->paginate();
    }
    
    public function getAllHistory(Request $request): LengthAwarePaginator
    {
        $query = $this->aiSpendingHistoryRepository->getModel()->query();
        return BaseQuery::for($query, $request)->paginate();
    }
    
    public function getTotalUserCost(int $userId): float
    {
        return $this->aiSpendingHistoryRepository->getModel()->where('user_id', $userId)->sum('cost');
    }
}

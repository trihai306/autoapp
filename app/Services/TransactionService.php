<?php

namespace App\Services;

use App\Exceptions\InsufficientFundsException;
use App\Models\User;
use App\Models\Transaction;
use App\Queries\BaseQuery;
use App\Repositories\TransactionRepositoryInterface;
use App\Repositories\UserRepositoryInterface;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TransactionService
{
    protected $transactionRepository;
    protected $userRepository;

    public function __construct(TransactionRepositoryInterface $transactionRepository, UserRepositoryInterface $userRepository)
    {
        $this->transactionRepository = $transactionRepository;
        $this->userRepository = $userRepository;
    }

    public function deposit(User $user, float $amount, string $description): \App\Models\Transaction
    {
        // For now, all deposits are auto-approved.
        // In the future, you might want to create a pending deposit first
        // and have an admin approve it.
        return DB::transaction(function () use ($user, $amount, $description) {
            $user->increment('balance', $amount);

            return $this->transactionRepository->create([
                'user_id' => $user->id,
                'type' => 'deposit',
                'amount' => $amount,
                'description' => $description,
                'status' => 'completed',
            ]);
        });
    }

    public function withdrawal(User $user, float $amount, string $description): \App\Models\Transaction
    {
        // For now, all withdrawals are created as pending and need approval.
        return DB::transaction(function () use ($user, $amount, $description) {
            if ($user->balance < $amount) {
                throw new InsufficientFundsException('Insufficient funds to create a withdrawal request.');
            }
            // Note: We don't decrement the balance here. 
            // The balance is only decremented when the withdrawal is approved.

            return $this->transactionRepository->create([
                'user_id' => $user->id,
                'type' => 'withdrawal',
                'amount' => $amount,
                'description' => $description,
                'status' => 'pending',
            ]);
        });
    }

    public function getHistory(User $user, Request $request)
    {
        $query = $this->transactionRepository->getModel()->query()->where('user_id', $user->id);

        if (!$request->has('sort')) {
            $query->latest();
        }

        return BaseQuery::for($query, $request)->paginate();
    }

    public function getAllTransactions(Request $request)
    {
        $query = $this->transactionRepository->getModel()->query()->with('user');

        if (!$request->has('sort')) {
            $query->latest();
        }

        return BaseQuery::for($query, $request)->paginate();
    }

    public function getTransactionById(int $id): ?\App\Models\Transaction
    {
        return $this->transactionRepository->find($id, ['user']);
    }

    public function approveTransaction(Transaction $transaction): Transaction
    {
        if ($transaction->status !== 'pending') {
            throw new \Exception('Only pending transactions can be approved.');
        }

        return DB::transaction(function () use ($transaction) {
            if ($transaction->type === 'withdrawal') {
                $user = $transaction->user;
                if ($user->balance < $transaction->amount) {
                    $transaction->update(['status' => 'failed', 'description' => 'Insufficient funds at time of approval.']);
                    throw new InsufficientFundsException('Insufficient funds at time of approval.');
                }
                $user->decrement('balance', $transaction->amount);
            }
            
            // In a real app, you would handle other transaction types like 'deposit' here if they need approval.

            $this->transactionRepository->update($transaction, ['status' => 'completed']);
            return $transaction->fresh();
        });
    }

    public function rejectTransaction(Transaction $transaction): Transaction
    {
        if ($transaction->status !== 'pending') {
            throw new \Exception('Only pending transactions can be rejected.');
        }

        $this->transactionRepository->update($transaction, ['status' => 'failed']);
        return $transaction->fresh();
    }

    public function deleteTransaction(int $id): bool
    {
        return $this->transactionRepository->delete($id);
    }

    public function deleteMultipleTransactions(array $ids): int
    {
        return $this->transactionRepository->deleteByIds($ids);
    }

    public function getStatistics(): array
    {
        $totalTransactions = Transaction::count();
        $pendingTransactions = Transaction::where('status', 'pending')->count();
        $completedTransactions = Transaction::where('status', 'completed')->count();
        $failedTransactions = Transaction::where('status', 'failed')->count();
        $totalAmount = Transaction::sum('amount');
        $depositAmount = Transaction::where('type', 'deposit')->sum('amount');
        $withdrawalAmount = Transaction::where('type', 'withdrawal')->sum('amount');

        return [
            'totalTransactions' => $totalTransactions,
            'pendingTransactions' => $pendingTransactions,
            'completedTransactions' => $completedTransactions,
            'failedTransactions' => $failedTransactions,
            'totalAmount' => (float) $totalAmount,
            'depositAmount' => (float) $depositAmount,
            'withdrawalAmount' => (float) $withdrawalAmount,
        ];
    }
}

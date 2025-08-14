<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use App\Services\TransactionService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Dedoc\Scramble\Attributes\QueryParameter;
use App\Exceptions\InsufficientFundsException;
use Dedoc\Scramble\Attributes\Group;

/**
 * @authenticated
 */
#[Group('Transactions')]
class TransactionController extends Controller
{
    protected $transactionService;

    public function __construct(TransactionService $transactionService)
    {
        $this->transactionService = $transactionService;
    }

    /**
     * Deposit funds
     *
     * Adds a specified amount to the authenticated user's balance.
     * @response \App\Models\Transaction
     */
    public function deposit(Request $request)
    {
        $validated = $request->validate([
            /**
             * The amount to deposit. Must be greater than 0.
             * @example 50.25
             */
            'amount' => 'required|numeric|min:0.01',
            /**
             * A description for the transaction.
             * @example "Monthly deposit"
             */
            'description' => 'nullable|string',
        ]);

        $transaction = $this->transactionService->deposit(
            Auth::user(),
            $validated['amount'],
            $validated['description'] ?? 'Deposit'
        );

        return response()->json($transaction, 201);
    }

    /**
     * Request a withdrawal
     *
     * Creates a pending withdrawal request from the authenticated user's balance.
     * @throws InsufficientFundsException if the user has insufficient funds to make the request.
     * @response \App\Models\Transaction
     */
    public function withdrawal(Request $request)
    {
        $validated = $request->validate([
            /**
             * The amount to withdraw. Must be greater than 0.
             * @example 20
             */
            'amount' => 'required|numeric|min:0.01',
            /**
             * A description for the transaction.
             * @example "ATM withdrawal"
             */
            'description' => 'nullable|string',
        ]);

        try {
            $transaction = $this->transactionService->withdrawal(
                Auth::user(),
                $validated['amount'],
                $validated['description'] ?? 'Withdrawal Request'
            );
            return response()->json($transaction, 201);
        } catch (InsufficientFundsException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    /**
     * Get transaction history for the authenticated user
     *
     * Retrieve a paginated list of the authenticated user's transactions.
     * Supports filtering and sorting.
     *
     * @response \Illuminate\Pagination\LengthAwarePaginator<App\Models\Transaction>
     */
    #[QueryParameter('filter[type]', description: 'Filter transactions by type (`deposit` or `withdrawal`).', example: 'deposit')]
    #[QueryParameter('sort', description: 'Sort by `amount` or `created_at`. Prefix with `-` for descending.', example: '-amount')]
    #[QueryParameter('page', description: 'The page number for pagination.', example: 1)]
    #[QueryParameter('per_page', description: 'The number of items per page.', example: 15)]
    public function getUserHistory(Request $request)
    {
        $transactions = $this->transactionService->getHistory(Auth::user(), $request);
        return response()->json($transactions);
    }

    /**
     * List all transactions (Admin)
     *
     * Retrieve a paginated list of all transactions.
     * Supports searching, filtering, and sorting.
     *
     * @response \Illuminate\Pagination\LengthAwarePaginator<App\Models\Transaction>
     */
    #[QueryParameter('search', description: 'Search transactions by description or type.', example: 'Monthly')]
    #[QueryParameter('filter[type]', description: 'Filter transactions by type (`deposit` or `withdrawal`).', example: 'deposit')]
    #[QueryParameter('filter[user_id]', description: 'Filter transactions by user ID.', example: 1)]
    #[QueryParameter('filter[status]', description: 'Filter transactions by status (`pending`, `completed`, `failed`).', example: 'pending')]
    #[QueryParameter('sort', description: 'Sort by `amount`, `created_at`, `status`, or `type`. Prefix with `-` for descending.', example: '-amount')]
    public function index(Request $request)
    {
        $transactions = $this->transactionService->getAllTransactions($request);
        return response()->json($transactions);
    }

    /**
     * Get a specific transaction (Admin)
     *
     * @param Transaction $transaction The transaction model instance.
     * @response \App\Models\Transaction
     */
    public function show(Transaction $transaction)
    {
        return response()->json($this->transactionService->getTransactionById($transaction->id));
    }

    /**
     * Approve a pending transaction (Admin)
     * @response \App\Models\Transaction
     */
    public function approve(Transaction $transaction)
    {
        try {
            $updatedTransaction = $this->transactionService->approveTransaction($transaction);
            return response()->json($updatedTransaction);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    /**
     * Reject a pending transaction (Admin)
     * @response \App\Models\Transaction
     */
    public function reject(Transaction $transaction)
    {
        try {
            $updatedTransaction = $this->transactionService->rejectTransaction($transaction);
            return response()->json($updatedTransaction);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    /**
     * Delete a transaction (Admin)
     *
     * @param Transaction $transaction The transaction model instance.
     */
    public function destroy(Transaction $transaction)
    {
        $this->transactionService->deleteTransaction($transaction->id);
        return response()->json(null, 204);
    }

    /**
     * Delete multiple transactions (Admin)
     */
    public function bulkDelete(Request $request)
    {
        $validated = $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:transactions,id',
        ]);

        $count = $this->transactionService->deleteMultipleTransactions($validated['ids']);

        return response()->json(['message' => "Successfully deleted {$count} transactions."]);
    }

    /**
     * Get transaction statistics
     *
     * Retrieves statistical data about transactions including totals by status and type, 
     * amounts, and recent activity.
     * 
     * @response {
     *   "data": {
     *     "totalTransactions": 5420,
     *     "pendingTransactions": 45,
     *     "completedTransactions": 5200,
     *     "failedTransactions": 175,
     *     "totalAmount": 2500000.75,
     *     "depositAmount": 1800000.50,
     *     "withdrawalAmount": 700000.25
     *   }
     * }
     */
    public function stats(Request $request)
    {
        $stats = $this->transactionService->getStatistics();
        
        return response()->json([
            'data' => $stats
        ]);
    }
}

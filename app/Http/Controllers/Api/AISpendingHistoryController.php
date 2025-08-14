<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\AISpendingHistoryService;
use Dedoc\Scramble\Attributes\Group;
use Dedoc\Scramble\Attributes\QueryParameter;
use Illuminate\Http\Request;

/**
 * @authenticated
 */
#[Group('AI Spending')]
class AISpendingHistoryController extends Controller
{
    protected $aiSpendingHistoryService;

    public function __construct(AISpendingHistoryService $aiSpendingHistoryService)
    {
        $this->aiSpendingHistoryService = $aiSpendingHistoryService;
    }

    /**
     * Record AI usage
     *
     * Records a new AI feature usage event for the authenticated user.
     */
    public function recordUsage(Request $request)
    {
        $validated = $request->validate([
            /**
             * The name of the AI feature used.
             * @example Text Generation
             */
            'feature_name' => 'required|string|max:255',
            /**
             * The name of the AI model used.
             * @example GPT-4
             */
            'model_name' => 'required|string|max:255',
            /**
             * The number of tokens used.
             * @example 1500
             */
            'tokens_used' => 'required|integer',
            /**
             * The cost associated with the usage.
             * @example 0.05
             */
            'cost' => 'required|numeric',
        ]);

        $history = $this->aiSpendingHistoryService->recordUsage($validated);

        return response()->json($history, 201);
    }

    /**
     * Get user's AI spending history
     *
     * Retrieve a paginated list of the authenticated user's AI spending history.
     * Supports filtering and sorting.
     *
     * @response \Illuminate\Pagination\LengthAwarePaginator<App\Models\AISpendingHistory>
     */
    #[QueryParameter('filter[feature_name]', description: 'Filter by feature name.', example: 'Text Generation')]
    #[QueryParameter('filter[model_name]', description: 'Filter by model name.', example: 'GPT-4')]
    #[QueryParameter('sort', description: 'Sort by `cost`, `tokens_used`, or `created_at`. Prefix with `-` for descending.', example: '-cost')]
    #[QueryParameter('page', description: 'The page number for pagination.', example: 1)]
    #[QueryParameter('per_page', description: 'The number of items per page.', example: 15)]
    public function index(Request $request)
    {
        $history = $this->aiSpendingHistoryService->getHistory($request);
        return response()->json($history);
    }
}

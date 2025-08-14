<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\TransactionAnalyticService;
use Dedoc\Scramble\Attributes\Group;
use Illuminate\Http\Request;

/**
 * API for fetching transaction analytics data.
 * @authenticated
 */
#[Group('Analytics')]
class TransactionAnalyticController extends Controller
{
    protected $transactionAnalyticService;

    public function __construct(TransactionAnalyticService $transactionAnalyticService)
    {
        $this->transactionAnalyticService = $transactionAnalyticService;
    }

    /**
     * Get Transaction Analytics
     *
     * Retrieves transaction analytics data for different periods: this month, this week, and this year.
     * The data includes purchases, refunds, and other metrics.
     *
     * @response {
     *  "thisMonth": {"webAnalytic": {}, "metrics": {}, "topPages": [], "deviceSession": {}, "topChannel": {}, "traffic": []},
     *  "thisWeek": {"webAnalytic": {}, "metrics": {}, "topPages": [], "deviceSession": {}, "topChannel": {}, "traffic": []},
     *  "thisYear": {"webAnalytic": {}, "metrics": {}, "topPages": [], "deviceSession": {}, "topChannel": {}, "traffic": []}
     * }
     */
    public function __invoke(Request $request)
    {
        $analytics = $this->transactionAnalyticService->getAnalytics();
        return response()->json($analytics);
    }
}

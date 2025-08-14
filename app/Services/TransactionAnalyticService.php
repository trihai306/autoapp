<?php

namespace App\Services;

use App\Models\Transaction;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class TransactionAnalyticService
{
    public function getAnalytics()
    {
        $now = Carbon::now();
        $thisMonthRange = ['start' => $now->copy()->startOfMonth(), 'end' => $now->copy()->endOfMonth()];
        $thisWeekRange = ['start' => $now->copy()->startOfWeek(), 'end' => $now->copy()->endOfWeek()];
        $thisYearRange = ['start' => $now->copy()->startOfYear(), 'end' => $now->copy()->endOfYear()];
        
        $prevMonthRange = ['start' => $now->copy()->subMonth()->startOfMonth(), 'end' => $now->copy()->subMonth()->endOfMonth()];
        $prevWeekRange = ['start' => $now->copy()->subWeek()->startOfWeek(), 'end' => $now->copy()->subWeek()->endOfWeek()];
        $prevYearRange = ['start' => $now->copy()->subYear()->startOfYear(), 'end' => $now->copy()->subYear()->endOfYear()];

        $thisMonthData = $this->getAnalyticsForPeriod($thisMonthRange['start'], $thisMonthRange['end'], $prevMonthRange['start'], $prevMonthRange['end']);
        $thisWeekData = $this->getAnalyticsForPeriod($thisWeekRange['start'], $thisWeekRange['end'], $prevWeekRange['start'], $prevWeekRange['end']);
        $thisYearData = $this->getAnalyticsForPeriod($thisYearRange['start'], $thisYearRange['end'], $prevYearRange['start'], $prevYearRange['end']);

        return [
            'thisMonth' => $thisMonthData,
            'thisWeek' => $thisWeekData,
            'thisYear' => $thisYearData,
        ];
    }

    private function getAnalyticsForPeriod(Carbon $startDate, Carbon $endDate, Carbon $prevStartDate, Carbon $prevEndDate)
    {
        $purchasesQuery = Transaction::where('type', 'purchase')->where('status', 'completed');
        $refundsQuery = Transaction::where('type', 'refund')->where('status', 'completed');

        $purchases = (clone $purchasesQuery)->whereBetween('created_at', [$startDate, $endDate])->select(DB::raw('DATE(created_at) as date'), DB::raw('sum(amount) as total'))->groupBy('date')->pluck('total', 'date');
        $refunds = (clone $refundsQuery)->whereBetween('created_at', [$startDate, $endDate])->select(DB::raw('DATE(created_at) as date'), DB::raw('sum(amount) as total'))->groupBy('date')->pluck('total', 'date');
        
        $totalPurchase = $purchases->sum();
        $totalRefund = $refunds->sum();
        $totalTransactions = (clone $purchasesQuery)->whereBetween('created_at', [$startDate, $endDate])->count() + (clone $refundsQuery)->whereBetween('created_at', [$startDate, $endDate])->count();
        
        $prevTotalPurchase = (clone $purchasesQuery)->whereBetween('created_at', [$prevStartDate, $prevEndDate])->sum('amount');
        $prevTotalRefund = (clone $refundsQuery)->whereBetween('created_at', [$prevStartDate, $prevEndDate])->sum('amount');
        $prevTotalTransactions = (clone $purchasesQuery)->whereBetween('created_at', [$prevStartDate, $prevEndDate])->count() + (clone $refundsQuery)->whereBetween('created_at', [$prevStartDate, $prevEndDate])->count();

        $dates = collect();
        for ($date = $startDate->copy(); $date->lte($endDate); $date->addDay()) {
            $dates->push($date->format('Y-m-d'));
        }

        $purchaseData = $dates->map(fn ($date) => $purchases->get($date, 0));
        $refundData = $dates->map(fn ($date) => $refunds->get($date, 0));
        
        $purchaseGrowth = $prevTotalPurchase > 0 ? (($totalPurchase - $prevTotalPurchase) / $prevTotalPurchase) * 100 : ($totalPurchase > 0 ? 100 : 0);
        $refundGrowth = $prevTotalRefund > 0 ? (($totalRefund - $prevTotalRefund) / $prevTotalRefund) * 100 : ($totalRefund > 0 ? 100 : 0);
        $transactionGrowth = $prevTotalTransactions > 0 ? (($totalTransactions - $prevTotalTransactions) / $prevTotalTransactions) * 100 : ($totalTransactions > 0 ? 100 : 0);
        
        $webAnalytic = [
            'series' => [
                ['name' => 'Purchases', 'data' => $purchaseData->values()],
                ['name' => 'Refunds', 'data' => $refundData->values()],
            ],
            'date' => $dates->all(),
            'pageView' => ['value' => $totalPurchase, 'growShrink' => round($purchaseGrowth, 2)],
            'avgTimeOnPage' => ['value' => 'N/A', 'growShrink' => 0],
        ];
        
        $metrics = [
            'visitors' => ['value' => $totalTransactions, 'growShrink' => round($transactionGrowth, 2)],
            'conversionRate' => ['value' => $totalPurchase, 'growShrink' => round($purchaseGrowth, 2)],
            'adCampaignClicks' => ['value' => $totalRefund, 'growShrink' => round($refundGrowth, 2)],
        ];

        $topPages = [];
        $deviceSession = ['series' => [], 'labels' => [], 'percentage' => []];
        $topChannel = ['visitors' => 0, 'channels' => []];
        $traffic = [];

        return compact('webAnalytic', 'metrics', 'topPages', 'deviceSession', 'topChannel', 'traffic');
    }
}

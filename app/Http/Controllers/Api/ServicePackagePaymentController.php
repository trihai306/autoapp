<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ServicePackage;
use App\Models\UserServicePackage;
use App\Models\Transaction;
use App\Exceptions\InsufficientFundsException;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class ServicePackagePaymentController extends Controller
{
    /**
     * Purchase a service package
     */
    public function purchase(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'service_package_id' => 'required|integer|exists:service_packages,id',
            'tier_id' => 'required|integer|exists:service_package_tiers,id',
            'price' => 'required|numeric|min:0',
            'payment_method' => 'nullable|string|max:255',
            'notes' => 'nullable|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Dữ liệu không hợp lệ',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();

            $user = Auth::user();
            $servicePackage = ServicePackage::findOrFail($request->service_package_id);

            // Kiểm tra gói dịch vụ có đang hoạt động không
            if (!$servicePackage->is_active) {
                return response()->json([
                    'success' => false,
                    'message' => 'Gói dịch vụ không khả dụng'
                ], 400);
            }

            // Kiểm tra số dư của user
            if (!$user->hasSufficientBalance($request->price)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Số dư không đủ để mua gói dịch vụ này',
                    'required_amount' => $request->price,
                    'current_balance' => $user->balance
                ], 400);
            }

            // Tạo transaction record
            $transaction = Transaction::create([
                'user_id' => $user->id,
                'type' => 'service_package_purchase',
                'amount' => -$request->price, // Số âm vì là chi tiêu
                'currency' => 'VND', // Mặc định VND
                'status' => 'completed',
                'description' => "Mua gói dịch vụ: {$servicePackage->name}",
                'reference_id' => $servicePackage->id,
                'reference_type' => ServicePackage::class,
                'metadata' => [
                    'package_name' => $servicePackage->name,
                    'tier_id' => $request->tier_id,
                    'tier_price' => $request->price,
                    'payment_method' => $request->payment_method,
                    'notes' => $request->notes,
                ]
            ]);

            // Trừ tiền từ balance của user
            if (!$user->deductBalance($request->price)) {
                throw new InsufficientFundsException('Không thể trừ tiền từ tài khoản');
            }

            // Tạo subscription
            $subscription = UserServicePackage::createSubscription(
                $user->id,
                $servicePackage->id,
                $request->price,
                'VND', // Mặc định VND
                (int) $transaction->id,
                $request->payment_method
            );

            // Cập nhật transaction với subscription_id
            $transaction->update([
                'reference_id' => $subscription->id,
                'reference_type' => UserServicePackage::class,
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Mua gói dịch vụ thành công',
                'data' => [
                    'subscription' => $subscription->load('servicePackage'),
                    'transaction' => $transaction,
                    'user_balance' => $user->fresh()->balance,
                ]
            ]);

        } catch (InsufficientFundsException $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Có lỗi xảy ra khi mua gói dịch vụ: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get user's service package subscriptions
     */
    public function getUserSubscriptions(Request $request): JsonResponse
    {
        $user = Auth::user();
        
        $subscriptions = $user->servicePackageSubscriptions()
            ->with(['servicePackage', 'transaction'])
            ->orderBy('created_at', 'desc')
            ->paginate($request->get('per_page', 15));

        return response()->json([
            'success' => true,
            'data' => $subscriptions
        ]);
    }

    /**
     * Get user's current active subscription
     */
    public function getCurrentSubscription(): JsonResponse
    {
        $user = Auth::user();
        $currentSubscription = $user->currentServicePackage();

        if (!$currentSubscription) {
            return response()->json([
                'success' => true,
                'message' => 'Bạn chưa có gói dịch vụ nào đang hoạt động',
                'data' => null
            ]);
        }

        return response()->json([
            'success' => true,
            'data' => $currentSubscription->load('servicePackage')
        ]);
    }

    /**
     * Extend current subscription
     */
    public function extendSubscription(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'days' => 'nullable|integer|min:1',
            'months' => 'nullable|integer|min:1',
            'years' => 'nullable|integer|min:1',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Dữ liệu không hợp lệ',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = Auth::user();
        $currentSubscription = $user->currentServicePackage();

        if (!$currentSubscription) {
            return response()->json([
                'success' => false,
                'message' => 'Bạn chưa có gói dịch vụ nào đang hoạt động'
            ], 400);
        }

        try {
            DB::beginTransaction();

            // Tính phí gia hạn (có thể là giá gốc hoặc giá ưu đãi)
            $package = $currentSubscription->servicePackage;
            $extensionPrice = $package->price;

            // Kiểm tra số dư
            if (!$user->hasSufficientBalance($extensionPrice)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Số dư không đủ để gia hạn gói dịch vụ',
                    'required_amount' => $extensionPrice,
                    'current_balance' => $user->balance
                ], 400);
            }

            // Tạo transaction
            $transaction = Transaction::create([
                'user_id' => $user->id,
                'type' => 'service_package_extension',
                'amount' => -$extensionPrice,
                'currency' => $package->currency,
                'status' => 'completed',
                'description' => "Gia hạn gói dịch vụ: {$package->name}",
                'reference_id' => $currentSubscription->id,
                'reference_type' => UserServicePackage::class,
                'metadata' => [
                    'package_name' => $package->name,
                    'extension_days' => $request->days,
                    'extension_months' => $request->months,
                    'extension_years' => $request->years,
                ]
            ]);

            // Trừ tiền
            $user->deductBalance($extensionPrice);

            // Gia hạn subscription
            $currentSubscription->extendSubscription(
                $request->days,
                $request->months,
                $request->years
            );

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Gia hạn gói dịch vụ thành công',
                'data' => [
                    'subscription' => $currentSubscription->fresh()->load('servicePackage'),
                    'transaction' => $transaction,
                    'user_balance' => $user->fresh()->balance,
                ]
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Có lỗi xảy ra khi gia hạn: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Cancel subscription
     */
    public function cancelSubscription(Request $request): JsonResponse
    {
        $user = Auth::user();
        $currentSubscription = $user->currentServicePackage();

        if (!$currentSubscription) {
            return response()->json([
                'success' => false,
                'message' => 'Bạn chưa có gói dịch vụ nào đang hoạt động'
            ], 400);
        }

        try {
            $currentSubscription->update(['status' => UserServicePackage::STATUS_CANCELLED]);

            return response()->json([
                'success' => true,
                'message' => 'Hủy gói dịch vụ thành công',
                'data' => $currentSubscription->fresh()->load('servicePackage')
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Có lỗi xảy ra khi hủy gói dịch vụ: ' . $e->getMessage()
            ], 500);
        }
    }
}
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ServicePackage;
use App\Services\ServicePackageService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Auth;

class ServicePackageController extends Controller
{
    protected $service;

    public function __construct(ServicePackageService $service)
    {
        $this->service = $service;
    }

    /**
     * Lấy danh sách packages
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $packages = $this->service->getAll($request->all());
            
            // Thêm thông tin subscription của user
            if (Auth::check()) {
                $packages = $this->addUserSubscriptionInfo($packages);
            }
            
            return response()->json([
                'success' => true,
                'data' => $packages,
                'message' => 'Packages retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error retrieving packages: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Lấy package theo ID
     */
    public function show(int $id): JsonResponse
    {
        try {
            $package = $this->service->getById($id);
            
            if (!$package) {
                return response()->json([
                    'success' => false,
                    'message' => 'Package not found'
                ], 404);
            }

            // Thêm thông tin subscription của user
            if (Auth::check()) {
                $package = $this->addUserSubscriptionInfo(collect([$package]))->first();
            }

            return response()->json([
                'success' => true,
                'data' => $package,
                'message' => 'Package retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error retrieving package: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Tạo package mới
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'category_id' => 'required|exists:service_package_categories,id',
                'name' => 'required|string|max:255',
                'description' => 'nullable|string',
                'duration_type' => 'required|in:days,months,years',
                'duration_value' => 'required|integer|min:1',
                'platform' => 'nullable|string|max:255',
                'platform_settings' => 'nullable|array',
                'is_active' => 'boolean',
                'is_popular' => 'boolean',
                'sort_order' => 'integer|min:0',
                'features' => 'nullable|array',
                'limits' => 'nullable|array',
                'icon' => 'nullable|string|max:255',
                'color' => 'nullable|string|max:7',
            ]);

            $package = $this->service->create($validated);

            return response()->json([
                'success' => true,
                'data' => $package,
                'message' => 'Package created successfully'
            ], 201);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error creating package: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Cập nhật package
     */
    public function update(Request $request, int $id): JsonResponse
    {
        try {
            $validated = $request->validate([
                'category_id' => 'sometimes|required|exists:service_package_categories,id',
                'name' => 'sometimes|required|string|max:255',
                'description' => 'nullable|string',
                'duration_type' => 'sometimes|required|in:days,months,years',
                'duration_value' => 'sometimes|required|integer|min:1',
                'platform' => 'nullable|string|max:255',
                'platform_settings' => 'nullable|array',
                'is_active' => 'boolean',
                'is_popular' => 'boolean',
                'sort_order' => 'integer|min:0',
                'features' => 'nullable|array',
                'limits' => 'nullable|array',
                'icon' => 'nullable|string|max:255',
                'color' => 'nullable|string|max:7',
            ]);

            $package = $this->service->update($id, $validated);

            if (!$package) {
                return response()->json([
                    'success' => false,
                    'message' => 'Package not found'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $package,
                'message' => 'Package updated successfully'
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error updating package: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Xóa package
     */
    public function destroy(int $id): JsonResponse
    {
        try {
            $result = $this->service->delete($id);

            if (!$result) {
                return response()->json([
                    'success' => false,
                    'message' => 'Package not found'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'message' => 'Package deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error deleting package: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Lấy packages theo category
     */
    public function byCategory(int $categoryId): JsonResponse
    {
        try {
            $packages = $this->service->getByCategory($categoryId);

            // Thêm thông tin subscription của user
            if (Auth::check()) {
                $packages = $this->addUserSubscriptionInfo($packages);
            }

            return response()->json([
                'success' => true,
                'data' => $packages,
                'message' => 'Packages by category retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error retrieving packages by category: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Lấy packages theo platform
     */
    public function byPlatform(string $platform): JsonResponse
    {
        try {
            $packages = $this->service->getByPlatform($platform);

            // Thêm thông tin subscription của user
            if (Auth::check()) {
                $packages = $this->addUserSubscriptionInfo($packages);
            }

            return response()->json([
                'success' => true,
                'data' => $packages,
                'message' => 'Packages by platform retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error retrieving packages by platform: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Lấy packages với tiers
     */
    public function withTiers(int $id): JsonResponse
    {
        try {
            $package = $this->service->getWithTiers($id);

            if (!$package) {
                return response()->json([
                    'success' => false,
                    'message' => 'Package not found'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $package,
                'message' => 'Package with tiers retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error retrieving package with tiers: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Lấy tier phù hợp cho package
     */
    public function recommendTier(Request $request, int $id): JsonResponse
    {
        try {
            $validated = $request->validate([
                'device_count' => 'required|integer|min:1',
            ]);

            $tier = $this->service->recommendTier($id, $validated['device_count']);

            return response()->json([
                'success' => true,
                'data' => $tier,
                'message' => 'Recommended tier retrieved successfully'
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error recommending tier: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Thêm thông tin subscription của user vào danh sách packages
     */
    private function addUserSubscriptionInfo($packages)
    {
        if (!Auth::check()) {
            return $packages;
        }

        $user = Auth::user();
        $userSubscriptions = $user->servicePackageSubscriptions()
            ->where('status', 'active')
            ->where('expires_at', '>', now())
            ->get()
            ->keyBy('service_package_id');

        return $packages->map(function ($package) use ($userSubscriptions) {
            $subscription = $userSubscriptions->get($package->id);
            
            $package->user_subscription = $subscription ? [
                'id' => $subscription->id,
                'status' => $subscription->status,
                'started_at' => $subscription->started_at,
                'expires_at' => $subscription->expires_at,
                'amount_paid' => $subscription->amount_paid,
                'currency' => $subscription->currency,
                'payment_method' => $subscription->payment_method,
                'days_remaining' => $subscription->days_remaining,
                'remaining_percentage' => $subscription->remaining_percentage,
                'is_active' => $subscription->isActive(),
                'is_expired' => $subscription->isExpired(),
                'tier' => $subscription->tier ? $subscription->tier->full_info : null,
            ] : null;
            
            $package->is_purchased = $subscription !== null;
            
            return $package;
        });
    }
}
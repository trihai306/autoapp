<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ServicePackageTier;
use App\Services\ServicePackageTierService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;

class ServicePackageTierController extends Controller
{
    protected $service;

    public function __construct(ServicePackageTierService $service)
    {
        $this->service = $service;
    }

    /**
     * Lấy danh sách tiers
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $tiers = $this->service->getAll($request->all());
            
            return response()->json([
                'success' => true,
                'data' => $tiers,
                'message' => 'Tiers retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error retrieving tiers: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Lấy tier theo ID
     */
    public function show(int $id): JsonResponse
    {
        try {
            $tier = $this->service->getById($id);
            
            if (!$tier) {
                return response()->json([
                    'success' => false,
                    'message' => 'Tier not found'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $tier,
                'message' => 'Tier retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error retrieving tier: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Tạo tier mới
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'service_package_id' => 'required|exists:service_packages,id',
                'name' => 'required|string|max:255',
                'description' => 'nullable|string',
                'device_limit' => 'required|integer|min:-1',
                'price' => 'required|numeric|min:0',
                'currency' => 'string|max:3',
                'is_popular' => 'boolean',
                'is_active' => 'boolean',
                'sort_order' => 'integer|min:0',
                'features' => 'nullable|array',
                'limits' => 'nullable|array',
            ]);

            $tier = $this->service->create($validated);

            return response()->json([
                'success' => true,
                'data' => $tier,
                'message' => 'Tier created successfully'
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
                'message' => 'Error creating tier: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Cập nhật tier
     */
    public function update(Request $request, int $id): JsonResponse
    {
        try {
            $validated = $request->validate([
                'service_package_id' => 'sometimes|required|exists:service_packages,id',
                'name' => 'sometimes|required|string|max:255',
                'description' => 'nullable|string',
                'device_limit' => 'sometimes|required|integer|min:-1',
                'price' => 'sometimes|required|numeric|min:0',
                'currency' => 'string|max:3',
                'is_popular' => 'boolean',
                'is_active' => 'boolean',
                'sort_order' => 'integer|min:0',
                'features' => 'nullable|array',
                'limits' => 'nullable|array',
            ]);

            $tier = $this->service->update($id, $validated);

            if (!$tier) {
                return response()->json([
                    'success' => false,
                    'message' => 'Tier not found'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $tier,
                'message' => 'Tier updated successfully'
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
                'message' => 'Error updating tier: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Xóa tier
     */
    public function destroy(int $id): JsonResponse
    {
        try {
            $result = $this->service->delete($id);

            if (!$result) {
                return response()->json([
                    'success' => false,
                    'message' => 'Tier not found'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'message' => 'Tier deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error deleting tier: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Lấy tiers theo package
     */
    public function byPackage(int $packageId): JsonResponse
    {
        try {
            $tiers = $this->service->getByPackage($packageId);

            return response()->json([
                'success' => true,
                'data' => $tiers,
                'message' => 'Tiers by package retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error retrieving tiers by package: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Lấy tiers theo số lượng thiết bị
     */
    public function byDeviceLimit(int $deviceLimit): JsonResponse
    {
        try {
            $tiers = $this->service->getByDeviceLimit($deviceLimit);

            return response()->json([
                'success' => true,
                'data' => $tiers,
                'message' => 'Tiers by device limit retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error retrieving tiers by device limit: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Lấy tier phù hợp nhất cho số lượng thiết bị
     */
    public function recommend(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'device_count' => 'required|integer|min:1',
                'package_id' => 'nullable|exists:service_packages,id',
                'category_id' => 'nullable|exists:service_package_categories,id',
            ]);

            $tier = $this->service->recommendTier($validated);

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
}
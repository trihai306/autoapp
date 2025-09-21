<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ServicePackageCategory;
use App\Services\ServicePackageCategoryService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;

class ServicePackageCategoryController extends Controller
{
    protected $service;

    public function __construct(ServicePackageCategoryService $service)
    {
        $this->service = $service;
    }

    /**
     * Lấy danh sách categories
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $categories = $this->service->getAll($request->all());
            
            return response()->json([
                'success' => true,
                'data' => $categories,
                'message' => 'Categories retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error retrieving categories: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Lấy category theo ID
     */
    public function show(int $id): JsonResponse
    {
        try {
            $category = $this->service->getById($id);
            
            if (!$category) {
                return response()->json([
                    'success' => false,
                    'message' => 'Category not found'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $category,
                'message' => 'Category retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error retrieving category: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Tạo category mới
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'description' => 'nullable|string',
                'icon' => 'nullable|string|max:255',
                'color' => 'nullable|string|max:7',
                'is_active' => 'boolean',
                'sort_order' => 'integer|min:0',
                'settings' => 'nullable|array',
            ]);

            $category = $this->service->create($validated);

            return response()->json([
                'success' => true,
                'data' => $category,
                'message' => 'Category created successfully'
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
                'message' => 'Error creating category: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Cập nhật category
     */
    public function update(Request $request, int $id): JsonResponse
    {
        try {
            $validated = $request->validate([
                'name' => 'sometimes|required|string|max:255',
                'description' => 'nullable|string',
                'icon' => 'nullable|string|max:255',
                'color' => 'nullable|string|max:7',
                'is_active' => 'boolean',
                'sort_order' => 'integer|min:0',
                'settings' => 'nullable|array',
            ]);

            $category = $this->service->update($id, $validated);

            if (!$category) {
                return response()->json([
                    'success' => false,
                    'message' => 'Category not found'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $category,
                'message' => 'Category updated successfully'
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
                'message' => 'Error updating category: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Xóa category
     */
    public function destroy(int $id): JsonResponse
    {
        try {
            $result = $this->service->delete($id);

            if (!$result) {
                return response()->json([
                    'success' => false,
                    'message' => 'Category not found'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'message' => 'Category deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error deleting category: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Lấy packages của category
     */
    public function packages(int $id): JsonResponse
    {
        try {
            $packages = $this->service->getPackages($id);

            return response()->json([
                'success' => true,
                'data' => $packages,
                'message' => 'Category packages retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error retrieving category packages: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Lấy packages với tiers
     */
    public function packagesWithTiers(int $id): JsonResponse
    {
        try {
            $packages = $this->service->getPackagesWithTiers($id);

            return response()->json([
                'success' => true,
                'data' => $packages,
                'message' => 'Category packages with tiers retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error retrieving category packages with tiers: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Lấy packages theo platform
     */
    public function packagesByPlatform(int $id, string $platform): JsonResponse
    {
        try {
            $packages = $this->service->getPackagesByPlatform($id, $platform);

            return response()->json([
                'success' => true,
                'data' => $packages,
                'message' => 'Category packages by platform retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error retrieving category packages by platform: ' . $e->getMessage()
            ], 500);
        }
    }
}
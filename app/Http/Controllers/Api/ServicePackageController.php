<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ServicePackage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ServicePackageController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        $query = ServicePackage::with('features')
            ->active()
            ->ordered();

        // Lọc theo gói phổ biến
        if ($request->boolean('popular')) {
            $query->popular();
        }

        // Lọc theo giá
        if ($request->has('min_price')) {
            $query->where('price', '>=', $request->input('min_price'));
        }

        if ($request->has('max_price')) {
            $query->where('price', '<=', $request->input('max_price'));
        }

        // Lọc theo thời hạn
        if ($request->has('duration_type')) {
            $durationType = $request->input('duration_type');
            switch ($durationType) {
                case 'days':
                    $query->whereNotNull('duration_days');
                    break;
                case 'months':
                    $query->whereNotNull('duration_months');
                    break;
                case 'years':
                    $query->whereNotNull('duration_years');
                    break;
                case 'unlimited':
                    $query->whereNull('duration_days')
                          ->whereNull('duration_months')
                          ->whereNull('duration_years');
                    break;
            }
        }

        $packages = $query->get();

        return response()->json([
            'success' => true,
            'data' => $packages,
            'message' => 'Danh sách gói dịch vụ được tải thành công'
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:service_packages,slug',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'currency' => 'required|string|size:3',
            'duration_days' => 'nullable|integer|min:1',
            'duration_months' => 'nullable|integer|min:1',
            'duration_years' => 'nullable|integer|min:1',
            'is_active' => 'boolean',
            'is_popular' => 'boolean',
            'sort_order' => 'integer|min:0',
            'features' => 'nullable|array',
            'limits' => 'nullable|array',
            'icon' => 'nullable|string|max:255',
            'color' => 'nullable|string|size:7',
        ]);

        $package = ServicePackage::create($validated);

        return response()->json([
            'success' => true,
            'data' => $package->load('features'),
            'message' => 'Gói dịch vụ đã được tạo thành công'
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id): JsonResponse
    {
        $package = ServicePackage::with('features')
            ->where('id', $id)
            ->orWhere('slug', $id)
            ->first();

        if (!$package) {
            return response()->json([
                'success' => false,
                'message' => 'Gói dịch vụ không tồn tại'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $package,
            'message' => 'Thông tin gói dịch vụ được tải thành công'
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $package = ServicePackage::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'slug' => [
                'sometimes',
                'string',
                'max:255',
                Rule::unique('service_packages', 'slug')->ignore($package->id)
            ],
            'description' => 'nullable|string',
            'price' => 'sometimes|required|numeric|min:0',
            'currency' => 'sometimes|required|string|size:3',
            'duration_days' => 'nullable|integer|min:1',
            'duration_months' => 'nullable|integer|min:1',
            'duration_years' => 'nullable|integer|min:1',
            'is_active' => 'boolean',
            'is_popular' => 'boolean',
            'sort_order' => 'integer|min:0',
            'features' => 'nullable|array',
            'limits' => 'nullable|array',
            'icon' => 'nullable|string|max:255',
            'color' => 'nullable|string|size:7',
        ]);

        $package->update($validated);

        return response()->json([
            'success' => true,
            'data' => $package->load('features'),
            'message' => 'Gói dịch vụ đã được cập nhật thành công'
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id): JsonResponse
    {
        $package = ServicePackage::findOrFail($id);
        $package->delete();

        return response()->json([
            'success' => true,
            'message' => 'Gói dịch vụ đã được xóa thành công'
        ]);
    }

    /**
     * Lấy danh sách gói dịch vụ phổ biến
     */
    public function popular(): JsonResponse
    {
        $packages = ServicePackage::with('features')
            ->active()
            ->popular()
            ->ordered()
            ->get();

        return response()->json([
            'success' => true,
            'data' => $packages,
            'message' => 'Danh sách gói dịch vụ phổ biến được tải thành công'
        ]);
    }

    /**
     * So sánh các gói dịch vụ
     */
    public function compare(Request $request): JsonResponse
    {
        $packageIds = $request->validate([
            'package_ids' => 'required|array|min:2|max:4',
            'package_ids.*' => 'integer|exists:service_packages,id'
        ])['package_ids'];

        $packages = ServicePackage::with('features')
            ->whereIn('id', $packageIds)
            ->active()
            ->ordered()
            ->get();

        return response()->json([
            'success' => true,
            'data' => $packages,
            'message' => 'So sánh gói dịch vụ được tải thành công'
        ]);
    }

    /**
     * Lấy thống kê gói dịch vụ
     */
    public function stats(): JsonResponse
    {
        $stats = [
            'total' => ServicePackage::count(),
            'active' => ServicePackage::active()->count(),
            'popular' => ServicePackage::popular()->count(),
            'free' => ServicePackage::where('price', 0)->count(),
            'paid' => ServicePackage::where('price', '>', 0)->count(),
            'by_duration' => [
                'days' => ServicePackage::whereNotNull('duration_days')->count(),
                'months' => ServicePackage::whereNotNull('duration_months')->count(),
                'years' => ServicePackage::whereNotNull('duration_years')->count(),
                'unlimited' => ServicePackage::whereNull('duration_days')
                    ->whereNull('duration_months')
                    ->whereNull('duration_years')
                    ->count(),
            ],
            'price_range' => [
                'min' => ServicePackage::min('price'),
                'max' => ServicePackage::max('price'),
                'avg' => ServicePackage::avg('price'),
            ]
        ];

        return response()->json([
            'success' => true,
            'data' => $stats,
            'message' => 'Thống kê gói dịch vụ được tải thành công'
        ]);
    }

    /**
     * Xóa nhiều gói dịch vụ
     */
    public function bulkDelete(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'ids' => 'required|array|min:1',
            'ids.*' => 'integer|exists:service_packages,id'
        ]);

        $deletedCount = ServicePackage::whereIn('id', $validated['ids'])->delete();

        return response()->json([
            'success' => true,
            'data' => ['deleted_count' => $deletedCount],
            'message' => "Đã xóa {$deletedCount} gói dịch vụ thành công"
        ]);
    }

    /**
     * Cập nhật trạng thái nhiều gói dịch vụ
     */
    public function bulkUpdateStatus(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'ids' => 'required|array|min:1',
            'ids.*' => 'integer|exists:service_packages,id',
            'status' => 'required|boolean'
        ]);

        $updatedCount = ServicePackage::whereIn('id', $validated['ids'])
            ->update(['is_active' => $validated['status']]);

        return response()->json([
            'success' => true,
            'data' => ['updated_count' => $updatedCount],
            'message' => "Đã cập nhật trạng thái {$updatedCount} gói dịch vụ thành công"
        ]);
    }

    /**
     * Tìm kiếm gói dịch vụ
     */
    public function search(Request $request): JsonResponse
    {
        $query = $request->input('q', '');
        $filters = $request->only(['min_price', 'max_price', 'duration_type', 'popular', 'active']);

        $packages = ServicePackage::with('features')
            ->when($query, function ($q) use ($query) {
                return $q->where(function ($queryBuilder) use ($query) {
                    $queryBuilder->where('name', 'like', "%{$query}%")
                        ->orWhere('description', 'like', "%{$query}%");
                });
            })
            ->when(isset($filters['min_price']), function ($q) use ($filters) {
                return $q->where('price', '>=', $filters['min_price']);
            })
            ->when(isset($filters['max_price']), function ($q) use ($filters) {
                return $q->where('price', '<=', $filters['max_price']);
            })
            ->when(isset($filters['duration_type']), function ($q) use ($filters) {
                $durationType = $filters['duration_type'];
                switch ($durationType) {
                    case 'days':
                        return $q->whereNotNull('duration_days');
                    case 'months':
                        return $q->whereNotNull('duration_months');
                    case 'years':
                        return $q->whereNotNull('duration_years');
                    case 'unlimited':
                        return $q->whereNull('duration_days')
                            ->whereNull('duration_months')
                            ->whereNull('duration_years');
                }
            })
            ->when(isset($filters['popular']), function ($q) use ($filters) {
                return $q->where('is_popular', $filters['popular']);
            })
            ->when(isset($filters['active']), function ($q) use ($filters) {
                return $q->where('is_active', $filters['active']);
            })
            ->active()
            ->ordered()
            ->get();

        return response()->json([
            'success' => true,
            'data' => $packages,
            'message' => 'Kết quả tìm kiếm gói dịch vụ'
        ]);
    }
}

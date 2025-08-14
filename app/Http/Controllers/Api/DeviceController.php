<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Device;
use App\Services\DeviceService;
use Dedoc\Scramble\Attributes\Group;
use Illuminate\Http\Request;

/**
 * APIs for managing Devices.
 * @authenticated
 */
#[Group('Device Management')]
class DeviceController extends Controller
{
    protected $deviceService;

    public function __construct(DeviceService $deviceService)
    {
        $this->deviceService = $deviceService;
    }

    /**
     * List all devices
     *
     * Retrieve a paginated list of all devices.
     * Supports searching, filtering, and sorting.
     * Admin can see all devices, regular users can only see their own devices.
     *
     * @response \Illuminate\Pagination\LengthAwarePaginator<App\Models\Device>
     */
    public function index(Request $request)
    {
        $user = $request->user();
        
        // Nếu user là admin, hiển thị tất cả devices
        if ($user->hasRole('admin')) {
            return response()->json($this->deviceService->getAll($request));
        }
        
        // Nếu không phải admin, chỉ hiển thị devices của user đó
        $request->merge(['user_id' => $user->id]);
        return response()->json($this->deviceService->getAll($request));
    }

    /**
     * Create a new device
     *
     * Creates a new device with the given details.
     */
    public function store(Request $request)
    {
        $user = $request->user();
        
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'device_name' => 'required|string|max:255',
            'device_id' => 'required|string|unique:devices,device_id',
            'serial' => 'nullable|string',
            'plan' => 'nullable|string',
            'is_online' => 'sometimes|boolean',
            'proxy_id' => 'nullable|integer', // Add exists rule when Proxy model is ready
            'note' => 'nullable|string',
            'os_version' => 'nullable|string',
            'device_type' => 'nullable|string',
            'platform' => 'nullable|string',
            'app_version' => 'nullable|string',
            'ip_address' => 'nullable|ip',
            'user_agent' => 'nullable|string',
            'status' => 'sometimes|in:active,inactive,blocked',
        ]);

        // Kiểm tra quyền: chỉ admin mới có thể tạo device cho user khác
        if (!$user->hasRole('admin') && $validated['user_id'] != $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $device = $this->deviceService->create($validated);

        return response()->json($device, 201);
    }

    /**
     * Get a specific device
     *
     * Retrieves the details of a specific device by its ID.
     * Admin can see any device, regular users can only see their own devices.
     */
    public function show(Request $request, Device $device)
    {
        $user = $request->user();
        
        // Kiểm tra quyền: chỉ admin hoặc chủ sở hữu mới có thể xem
        if (!$user->hasRole('admin') && $device->user_id != $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return response()->json($device);
    }

    /**
     * Update a device
     *
     * Updates the details of a specific device.
     * Admin can update any device, regular users can only update their own devices.
     */
    public function update(Request $request, Device $device)
    {
        $user = $request->user();
        
        // Kiểm tra quyền: chỉ admin hoặc chủ sở hữu mới có thể cập nhật
        if (!$user->hasRole('admin') && $device->user_id != $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'device_name' => 'sometimes|string|max:255',
            'serial' => 'nullable|string',
            'plan' => 'nullable|string',
            'is_online' => 'sometimes|boolean',
            'proxy_id' => 'nullable|integer', // Add exists rule when Proxy model is ready
            'note' => 'nullable|string',
            'os_version' => 'nullable|string',
            'device_type' => 'nullable|string',
            'platform' => 'nullable|string',
            'app_version' => 'nullable|string',
            'ip_address' => 'nullable|ip',
            'user_agent' => 'nullable|string',
            'status' => 'sometimes|in:active,inactive,blocked',
        ]);

        $updatedDevice = $this->deviceService->update($device, $validated);

        return response()->json($updatedDevice);
    }

    /**
     * Delete a device
     *
     * Deletes a specific device.
     * Admin can delete any device, regular users can only delete their own devices.
     */
    public function destroy(Request $request, Device $device)
    {
        $user = $request->user();
        
        // Kiểm tra quyền: chỉ admin hoặc chủ sở hữu mới có thể xóa
        if (!$user->hasRole('admin') && $device->user_id != $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $this->deviceService->delete($device);

        return response()->json(null, 204);
    }

    /**
     * Bulk delete devices
     *
     * Deletes multiple devices at once.
     * Admin can delete any devices, regular users can only delete their own devices.
     */
    public function bulkDelete(Request $request)
    {
        $user = $request->user();
        
        $validated = $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'integer|exists:devices,id'
        ]);

        $devices = Device::whereIn('id', $validated['ids'])->get();
        
        // Check permissions for each device
        foreach ($devices as $device) {
            if (!$user->hasRole('admin') && $device->user_id != $user->id) {
                return response()->json(['message' => 'Unauthorized to delete some devices'], 403);
            }
        }

        foreach ($devices as $device) {
            $this->deviceService->delete($device);
        }

        return response()->json(['message' => 'Devices deleted successfully'], 200);
    }

    /**
     * Bulk update device status
     *
     * Updates status of multiple devices at once.
     * Admin can update any devices, regular users can only update their own devices.
     */
    public function bulkUpdateStatus(Request $request)
    {
        $user = $request->user();
        
        $validated = $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'integer|exists:devices,id',
            'status' => 'required|in:active,inactive,blocked'
        ]);

        $devices = Device::whereIn('id', $validated['ids'])->get();
        
        // Check permissions for each device
        foreach ($devices as $device) {
            if (!$user->hasRole('admin') && $device->user_id != $user->id) {
                return response()->json(['message' => 'Unauthorized to update some devices'], 403);
            }
        }

        foreach ($devices as $device) {
            $this->deviceService->update($device, ['status' => $validated['status']]);
        }

        return response()->json(['message' => 'Device status updated successfully'], 200);
    }

    /**
     * Get device statistics
     *
     * Returns statistics about devices including counts, online status, etc.
     */
    public function stats(Request $request)
    {
        $user = $request->user();
        
        $query = Device::query();
        
        // If not admin, only show user's devices
        if (!$user->hasRole('admin')) {
            $query->where('user_id', $user->id);
        }

        $total = $query->count();
        $online = $query->where('is_online', true)->count();
        $offline = $total - $online;
        $active = $query->where('status', 'active')->count();
        $inactive = $query->where('status', 'inactive')->count();
        $blocked = $query->where('status', 'blocked')->count();

        // Calculate rates
        $onlineRate = $total > 0 ? round(($online / $total) * 100, 1) : 0;
        $activeRate = $total > 0 ? round(($active / $total) * 100, 1) : 0;

        // Get device types distribution
        $deviceTypes = $query->select('device_type')
            ->selectRaw('count(*) as count')
            ->groupBy('device_type')
            ->get()
            ->map(function ($item) {
                return [
                    'label' => $item->device_type ?: 'Unknown',
                    'value' => $item->count
                ];
            });

        // Get platforms distribution
        $platforms = $query->select('platform')
            ->selectRaw('count(*) as count')
            ->groupBy('platform')
            ->get()
            ->map(function ($item) {
                return [
                    'label' => $item->platform ?: 'Unknown',
                    'value' => $item->count
                ];
            });

        return response()->json([
            'total' => $total,
            'online' => $online,
            'offline' => $offline,
            'active' => $active,
            'inactive' => $inactive,
            'blocked' => $blocked,
            'onlineRate' => $onlineRate,
            'activeRate' => $activeRate,
            'deviceTypes' => $deviceTypes,
            'platforms' => $platforms,
            'growth' => 0, // TODO: Calculate growth from previous period
            'chartData' => [] // TODO: Add chart data for trends
        ]);
    }

    /**
     * Get recent device activities
     *
     * Returns recent activities/events for devices.
     */
    public function recentActivities(Request $request)
    {
        $user = $request->user();
        
        $query = Device::query()->with('user');
        
        // If not admin, only show user's devices
        if (!$user->hasRole('admin')) {
            $query->where('user_id', $user->id);
        }

        $devices = $query->orderBy('updated_at', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($device) {
                return [
                    'device_name' => $device->device_name,
                    'device_type' => $device->device_type,
                    'action' => $device->is_online ? 'Online' : 'Offline',
                    'time' => $device->updated_at->diffForHumans(),
                    'duration' => '1m', // TODO: Calculate actual duration
                    'user' => $device->user->name ?? 'Unknown'
                ];
            });

        return response()->json($devices);
    }

    /**
     * Import devices from list
     *
     * Imports multiple devices from provided data.
     */
    public function import(Request $request)
    {
        $user = $request->user();
        
        $validated = $request->validate([
            'devices' => 'required|array',
            'devices.*.device_name' => 'required|string|max:255',
            'devices.*.device_id' => 'required|string',
            'devices.*.serial' => 'nullable|string',
            'devices.*.plan' => 'nullable|string',
            'devices.*.status' => 'sometimes|in:active,inactive,blocked',
            'devices.*.user_id' => 'nullable|exists:users,id',
            'devices.*.note' => 'nullable|string',
            'options' => 'sometimes|array'
        ]);

        $importedDevices = [];
        $errors = [];

        foreach ($validated['devices'] as $index => $deviceData) {
            try {
                // Check if device_id already exists
                if (Device::where('device_id', $deviceData['device_id'])->exists()) {
                    $errors[] = "Device ID '{$deviceData['device_id']}' already exists";
                    continue;
                }

                // Set default values
                $deviceData['status'] = $deviceData['status'] ?? 'active';
                $deviceData['user_id'] = $deviceData['user_id'] ?? $user->id;
                $deviceData['is_online'] = false;

                // Check permission for user assignment
                if (!$user->hasRole('admin') && $deviceData['user_id'] != $user->id) {
                    $errors[] = "Unauthorized to assign device to another user";
                    continue;
                }

                $device = $this->deviceService->create($deviceData);
                $importedDevices[] = $device;
            } catch (\Exception $e) {
                $errors[] = "Error importing device at index {$index}: " . $e->getMessage();
            }
        }

        return response()->json([
            'message' => 'Import completed',
            'imported' => count($importedDevices),
            'errors' => $errors,
            'devices' => $importedDevices
        ], 200);
    }
}

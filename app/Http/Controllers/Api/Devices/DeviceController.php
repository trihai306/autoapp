<?php

namespace App\Http\Controllers\Api\Devices;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Http\JsonResponse;
use App\Services\Interfaces\DeviceServiceInterface;
use Exception;
use App\Models\Device;
use Illuminate\Support\Facades\Auth;

class DeviceController extends Controller
{
    /**
     * @var DeviceServiceInterface
     */
    protected DeviceServiceInterface $service;

    public function __construct(DeviceServiceInterface $service)
    {
        $this->service = $service;
    }

    /**
     * Lấy danh sách thiết bị của user hiện tại với phân trang
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $devices = $this->service->getAll($request);
            
            return response()->json([
                'success' => true,
                'devices' => $devices,
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Lấy thông tin thiết bị theo ID (chỉ thiết bị của user hiện tại)
     *
     * @param int $id
     * @return JsonResponse
     */
    public function show(int $id): JsonResponse
    {
        try {
            $device = $this->service->getById($id);
            
            if (!$device) {
                return response()->json([
                    'success' => false,
                    'message' => 'Thiết bị không tồn tại',
                ], 404);
            }
            
            return response()->json([
                'success' => true,
                'device' => $device,
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Lưu thông tin thiết bị mới.
     *
     * @body array{
     *     device_name: string,
     *     device_id?: string,
     *     device_type?: "mobile"|"desktop"|"tablet",
     *     platform?: string,
     *     app_version?: string,
     *     ip_address?: string,
     *     user_agent?: string,
     *     status?: "active"|"inactive"|"blocked",
     *     push_tokens?: string[]
     * }
     * 
     * Lưu ý: user_id sẽ được tự động lấy từ người dùng đang đăng nhập (bỏ qua nếu client gửi)
     *
     * @response 201 array{
     *   success: true,
     *   device: App\Models\Device
     * }
     * @response 422 array{
     *   success: false,
     *   errors: array<string, string[]>
     * }
     * @response 500 array{
     *   success: false,
     *   message: string
     * }
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function store(Request $request): JsonResponse
    {
        // Debug: Kiểm tra thông tin request
        \Log::info('Device registration request', [
            'headers' => $request->headers->all(),
            'user' => $request->user(),
            'auth_check' => Auth::check(),
            'bearer_token' => $request->bearerToken(),
        ]);
        
        $validator = Validator::make($request->all(), [
            'device_name'   => 'required|string|max:255',
            'device_id'     => 'nullable|string|max:255',
            'device_type'   => 'nullable|in:mobile,desktop,tablet',
            'platform'      => 'nullable|string|max:100',
            'app_version'   => 'nullable|string|max:50',
            'ip_address'    => 'nullable|ip',
            'user_agent'    => 'nullable|string',
            'status'        => 'nullable|in:active,inactive,blocked',
            'push_tokens'   => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors'  => $validator->errors(),
            ], 422);
        }

        try {
            $data = $validator->validated();
            
            // Kiểm tra xác thực user
            if (!$request->user()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Token xác thực không hợp lệ hoặc đã hết hạn',
                ], 401);
            }
            
            // Tự động lấy user_id từ người dùng đang đăng nhập
            // Bỏ qua user_id nếu client có gửi trong request để đảm bảo an toàn
            $data['user_id'] = $request->user()->id;

            // Thực hiện cập nhật hoặc tạo mới dựa trên device_id
            $device = null;
            $statusCode = 201; // Mặc định: tạo mới

            if (!empty($data['device_id'])) {
                $device = $this->service->updateOrCreate($data);
                $statusCode = 200; // updateOrCreate luôn trả về 200
            } else {
                // Không có device_id, buộc phải tạo mới
                $device = $this->service->create($data);
            }

            return response()->json([
                'success' => true,
                'device'  => $device->fresh(),
            ], $statusCode);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Cập nhật thông tin thiết bị
     *
     * @param Request $request
     * @param int $id
     * @return JsonResponse
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'device_name'   => 'sometimes|string|max:255',
            'device_type'   => 'nullable|in:mobile,desktop,tablet',
            'platform'      => 'nullable|string|max:100',
            'app_version'   => 'nullable|string|max:50',
            'ip_address'    => 'nullable|ip',
            'user_agent'    => 'nullable|string',
            'status'        => 'nullable|in:active,inactive,blocked',
            'push_tokens'   => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors'  => $validator->errors(),
            ], 422);
        }

        try {
            $device = $this->service->getById($id);
            
            if (!$device) {
                return response()->json([
                    'success' => false,
                    'message' => 'Thiết bị không tồn tại',
                ], 404);
            }

            $updatedDevice = $this->service->update($device, $validator->validated());

            return response()->json([
                'success' => true,
                'device'  => $updatedDevice,
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Xóa thiết bị
     *
     * @param int $id
     * @return JsonResponse
     */
    public function destroy(int $id): JsonResponse
    {
        try {
            $device = $this->service->getById($id);
            
            if (!$device) {
                return response()->json([
                    'success' => false,
                    'message' => 'Thiết bị không tồn tại',
                ], 404);
            }

            $result = $this->service->delete($device);

            if ($result) {
                return response()->json([
                    'success' => true,
                    'message' => 'Thiết bị đã được xóa thành công',
                ]);
            }

            return response()->json([
                'success' => false,
                'message' => 'Không thể xóa thiết bị',
            ], 500);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Cập nhật trạng thái hoạt động của thiết bị
     *
     * @param Request $request
     * @param string $deviceId
     * @return JsonResponse
     */
    public function updateStatus(Request $request, string $deviceId): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'status' => 'required|in:active,inactive,blocked',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors'  => $validator->errors(),
            ], 422);
        }

        try {
            $device = $this->service->updateStatus($deviceId, $request->input('status'));
            
            if (!$device) {
                return response()->json([
                    'success' => false,
                    'message' => 'Thiết bị không tồn tại',
                ], 404);
            }

            return response()->json([
                'success' => true,
                'device'  => $device,
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Cập nhật thời gian hoạt động cuối cùng
     *
     * @param Request $request
     * @param string $deviceId
     * @return JsonResponse
     */
    public function updateLastActive(Request $request, string $deviceId): JsonResponse
    {
        try {
            $device = $this->service->updateLastActive($deviceId);
            
            if (!$device) {
                return response()->json([
                    'success' => false,
                    'message' => 'Thiết bị không tồn tại',
                ], 404);
            }

            return response()->json([
                'success' => true,
                'device'  => $device,
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }
} 
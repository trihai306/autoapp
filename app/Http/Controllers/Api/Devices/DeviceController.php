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
     * Lưu thông tin thiết bị mới.
     *
     * @body array{
     *     user_id?: int,
     *     device_name: string,
     *     serial?: string,
     *     plan?: string,
     *     is_online?: bool,
     *     proxy_key_uuid?: string,
     *     note?: string,
     *     os_version?: string,
     *     device_id?: string,
     *     device_type?: "mobile"|"desktop",
     *     platform?: string,
     *     app_version?: string,
     *     ip_address?: string,
     *     user_agent?: string,
     *     status?: "active"|"blocked",
     *     push_tokens?: string[]
     * }
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
        $validator = Validator::make($request->all(), [
            'user_id'       => 'nullable|integer|exists:users,id',
            'device_name'   => 'required|string|max:255',
            'serial'        => 'nullable|string|max:255',
            'plan'          => 'nullable|string|max:100',
            'is_online'     => 'nullable|boolean',
            'proxy_key_uuid'      => 'nullable|string|exists:proxy_keys,uuid',
            'note'          => 'nullable|string',
            'os_version'    => 'nullable|string|max:100',
            'device_id'     => 'nullable|string|max:255',
            'device_type'   => 'nullable|in:mobile,desktop',
            'platform'      => 'nullable|string|max:100',
            'app_version'   => 'nullable|string|max:50',
            'ip_address'    => 'nullable|ip',
            'user_agent'    => 'nullable|string',
            'status'        => 'nullable|in:active,blocked',
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

            // Ưu tiên lấy user_id từ người dùng đang đăng nhập
            if ($request->user()) {
                $data['user_id'] = $request->user()->id;
            }

            // Trường hợp không có user_id sau khi kiểm tra => trả lỗi
            if (empty($data['user_id'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Không xác định được user_id',
                ], 422);
            }

            // Thực hiện cập nhật hoặc tạo mới dựa trên device_id
            $device = null;
            $statusCode = 201; // Mặc định: tạo mới

            if (!empty($data['device_id'])) {
                $device = Device::updateOrCreate(
                    ['device_id' => $data['device_id']],
                    $data
                );

                // updateOrCreate trả về model; thuộc tính wasRecentlyCreated cho biết thao tác nào
                $statusCode = $device->wasRecentlyCreated ? 201 : 200;
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
} 
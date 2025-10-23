<?php

namespace App\Http\Controllers\Api\Devices;

use App\Http\Controllers\Controller;
use App\Models\FacebookAccount;
use App\Models\Device;
use App\Events\FacebookAccountTableReload;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Exception;

class FacebookDeviceController extends Controller
{
    /**
     * Cập nhật follower_count và username của tài khoản Facebook
     *
     * @param Request $request
     * @param string $deviceId
     * @param int $facebookAccountId
     * @return JsonResponse
     */
    public function updateFacebookAccount(Request $request, string $deviceId, int $facebookAccountId): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'follower_count' => 'required|integer|min:0',
            'username' => 'required|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Dữ liệu không hợp lệ',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            // Lấy user đang đăng nhập
            $user = $request->user();

            // Tìm device theo device_id
            $device = Device::where('device_id', $deviceId)->first();

            if (!$device) {
                return response()->json([
                    'success' => false,
                    'message' => 'Thiết bị không tồn tại',
                ], 404);
            }

            // Xác thực user đăng nhập có phải là chủ sở hữu của device không
            if ($device->user_id !== $user->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Bạn không có quyền cập nhật tài khoản Facebook của thiết bị này',
                ], 403);
            }

            // Tìm tài khoản Facebook thuộc về user và device
            $facebookAccount = FacebookAccount::where('id', $facebookAccountId)
                ->where('device_id', $device->id)
                ->where('user_id', $user->id)
                ->first();

            if (!$facebookAccount) {
                return response()->json([
                    'success' => false,
                    'message' => 'Tài khoản Facebook không tồn tại hoặc không thuộc về bạn',
                ], 404);
            }

            $data = $validator->validated();

            // Cập nhật chỉ follower_count và username
            $facebookAccount->update([
                'follower_count' => $data['follower_count'],
                'username' => $data['username'],
                'last_activity' => now(),
            ]);

            // Bắn event để refresh data table
            event(new FacebookAccountTableReload('Thông tin tài khoản Facebook đã được cập nhật thành công', $user->id));

            return response()->json([
                'success' => true,
                'message' => 'Thông tin tài khoản Facebook đã được cập nhật thành công',
                'data' => [
                    'facebook_account' => $facebookAccount->fresh(),
                ],
            ]);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Có lỗi xảy ra: ' . $e->getMessage(),
            ], 500);
        }
    }
}


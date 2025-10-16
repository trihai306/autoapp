<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Dedoc\Scramble\Attributes\Group;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

/**
 * APIs for Facebook Join Group Workflow Configuration.
 * Trả về config cho Android app để thực hiện workflow join group Facebook.
 * @authenticated
 */
#[Group('Facebook Join Group Workflow')]
class FacebookJoinGroupController extends Controller
{
    /**
     * Lấy config mặc định cho Join Group Workflow
     * 
     * Trả về cấu hình mặc định cơ bản để join nhóm Facebook
     * 
     * @response {
     *   "groupLinks": [],
     *   "groupNames": [],
     *   "maxGroups": 10,
     *   "maxDurationMinutes": 30,
     *   "delayBetweenJoinsMs": 3000,
     *   "searchDelayMs": 1500,
     *   "pageLoadDelayMs": 3000,
     *   "skipJoinedGroups": true,
     *   "joinPrivateGroups": true,
     *   "scrollToFindJoinButton": true,
     *   "maxScrollAttempts": 5
     * }
     */
    public function getDefaultConfig(Request $request)
    {
        Log::info('📋 Lấy default config cho Facebook Join Group');
        
        $config = [
            'groupLinks' => [],
            'groupNames' => [],
            'maxGroups' => 10,
            'maxDurationMinutes' => 30,
            'delayBetweenJoinsMs' => 3000,
            'searchDelayMs' => 1500,
            'pageLoadDelayMs' => 3000,
            'skipJoinedGroups' => true,
            'joinPrivateGroups' => true,
            'scrollToFindJoinButton' => true,
            'maxScrollAttempts' => 5
        ];

        return response()->json([
            'success' => true,
            'data' => $config,
            'message' => 'Default config retrieved successfully'
        ]);
    }

    /**
     * Lấy config cho Join by Links Workflow
     * 
     * Trả về cấu hình để join nhóm thông qua danh sách links
     * 
     * @bodyParam groupLinks string[] required Danh sách links nhóm cần join
     * @bodyParam maxGroups integer Số nhóm tối đa. Default: 10
     * @bodyParam maxDurationMinutes integer Thời gian tối đa (phút). Default: 20
     * 
     * @response {
     *   "groupLinks": ["https://facebook.com/groups/123", "https://facebook.com/groups/456"],
     *   "groupNames": [],
     *   "maxGroups": 10,
     *   "maxDurationMinutes": 20,
     *   "delayBetweenJoinsMs": 3000,
     *   "searchDelayMs": 1500,
     *   "pageLoadDelayMs": 3000,
     *   "skipJoinedGroups": true,
     *   "joinPrivateGroups": true,
     *   "scrollToFindJoinButton": true,
     *   "maxScrollAttempts": 5
     * }
     */
    public function getJoinByLinksConfig(Request $request)
    {
        $validated = $request->validate([
            'groupLinks' => 'required|array',
            'groupLinks.*' => 'required|string|url',
            'maxGroups' => 'sometimes|integer|min:1|max:50',
            'maxDurationMinutes' => 'sometimes|integer|min:1|max:120',
        ]);

        Log::info('🔗 Tạo config Join by Links', [
            'links_count' => count($validated['groupLinks']),
            'max_groups' => $validated['maxGroups'] ?? 10
        ]);

        $config = [
            'groupLinks' => $validated['groupLinks'],
            'groupNames' => [],
            'maxGroups' => $validated['maxGroups'] ?? 10,
            'maxDurationMinutes' => $validated['maxDurationMinutes'] ?? 20,
            'delayBetweenJoinsMs' => 3000,
            'searchDelayMs' => 1500,
            'pageLoadDelayMs' => 3000,
            'skipJoinedGroups' => true,
            'joinPrivateGroups' => true,
            'scrollToFindJoinButton' => true,
            'maxScrollAttempts' => 5
        ];

        return response()->json([
            'success' => true,
            'data' => $config,
            'message' => 'Join by links config created successfully'
        ]);
    }

    /**
     * Lấy config cho Join by Search Workflow
     * 
     * Trả về cấu hình để join nhóm thông qua tìm kiếm tên nhóm
     * 
     * @bodyParam groupNames string[] required Danh sách tên nhóm cần tìm và join
     * @bodyParam maxGroups integer Số nhóm tối đa. Default: 10
     * @bodyParam maxDurationMinutes integer Thời gian tối đa (phút). Default: 25
     * 
     * @response {
     *   "groupLinks": [],
     *   "groupNames": ["React Developers", "Laravel Vietnam"],
     *   "maxGroups": 10,
     *   "maxDurationMinutes": 25,
     *   "delayBetweenJoinsMs": 3000,
     *   "searchDelayMs": 1500,
     *   "pageLoadDelayMs": 3000,
     *   "skipJoinedGroups": true,
     *   "joinPrivateGroups": true,
     *   "scrollToFindJoinButton": true,
     *   "maxScrollAttempts": 5
     * }
     */
    public function getJoinBySearchConfig(Request $request)
    {
        $validated = $request->validate([
            'groupNames' => 'required|array',
            'groupNames.*' => 'required|string|max:255',
            'maxGroups' => 'sometimes|integer|min:1|max:50',
            'maxDurationMinutes' => 'sometimes|integer|min:1|max:120',
        ]);

        Log::info('🔍 Tạo config Join by Search', [
            'names_count' => count($validated['groupNames']),
            'max_groups' => $validated['maxGroups'] ?? 10
        ]);

        $config = [
            'groupLinks' => [],
            'groupNames' => $validated['groupNames'],
            'maxGroups' => $validated['maxGroups'] ?? 10,
            'maxDurationMinutes' => $validated['maxDurationMinutes'] ?? 25,
            'delayBetweenJoinsMs' => 3000,
            'searchDelayMs' => 1500,
            'pageLoadDelayMs' => 3000,
            'skipJoinedGroups' => true,
            'joinPrivateGroups' => true,
            'scrollToFindJoinButton' => true,
            'maxScrollAttempts' => 5
        ];

        return response()->json([
            'success' => true,
            'data' => $config,
            'message' => 'Join by search config created successfully'
        ]);
    }

    /**
     * Lấy config cho Fast Join Workflow
     * 
     * Trả về cấu hình tối ưu cho việc join nhanh (delay ngắn hơn)
     * 
     * @bodyParam groupLinks string[] required Danh sách links nhóm cần join
     * @bodyParam maxGroups integer Số nhóm tối đa. Default: 5
     * 
     * @response {
     *   "groupLinks": ["https://facebook.com/groups/123"],
     *   "groupNames": [],
     *   "maxGroups": 5,
     *   "maxDurationMinutes": 10,
     *   "delayBetweenJoinsMs": 1000,
     *   "searchDelayMs": 1000,
     *   "pageLoadDelayMs": 2000,
     *   "skipJoinedGroups": true,
     *   "joinPrivateGroups": true,
     *   "scrollToFindJoinButton": true,
     *   "maxScrollAttempts": 5
     * }
     */
    public function getFastJoinConfig(Request $request)
    {
        $validated = $request->validate([
            'groupLinks' => 'required|array',
            'groupLinks.*' => 'required|string|url',
            'maxGroups' => 'sometimes|integer|min:1|max:20',
        ]);

        Log::info('⚡ Tạo config Fast Join', [
            'links_count' => count($validated['groupLinks']),
            'max_groups' => $validated['maxGroups'] ?? 5
        ]);

        $config = [
            'groupLinks' => $validated['groupLinks'],
            'groupNames' => [],
            'maxGroups' => $validated['maxGroups'] ?? 5,
            'maxDurationMinutes' => 10,
            'delayBetweenJoinsMs' => 1000,
            'searchDelayMs' => 1000,
            'pageLoadDelayMs' => 2000,
            'skipJoinedGroups' => true,
            'joinPrivateGroups' => true,
            'scrollToFindJoinButton' => true,
            'maxScrollAttempts' => 5
        ];

        return response()->json([
            'success' => true,
            'data' => $config,
            'message' => 'Fast join config created successfully'
        ]);
    }

    /**
     * Tạo custom config với tất cả tham số tùy chỉnh
     * 
     * Cho phép tùy chỉnh đầy đủ tất cả các tham số của workflow
     * 
     * @bodyParam groupLinks string[] Danh sách links nhóm
     * @bodyParam groupNames string[] Danh sách tên nhóm
     * @bodyParam maxGroups integer Số nhóm tối đa
     * @bodyParam maxDurationMinutes integer Thời gian tối đa (phút)
     * @bodyParam delayBetweenJoinsMs integer Delay giữa các lần join (ms)
     * @bodyParam searchDelayMs integer Delay sau khi search (ms)
     * @bodyParam pageLoadDelayMs integer Delay chờ page load (ms)
     * @bodyParam skipJoinedGroups boolean Bỏ qua nhóm đã join
     * @bodyParam joinPrivateGroups boolean Join cả nhóm riêng tư
     * @bodyParam scrollToFindJoinButton boolean Scroll để tìm nút Join
     * @bodyParam maxScrollAttempts integer Số lần scroll tối đa
     */
    public function createCustomConfig(Request $request)
    {
        $validated = $request->validate([
            'groupLinks' => 'sometimes|array',
            'groupLinks.*' => 'required|string|url',
            'groupNames' => 'sometimes|array',
            'groupNames.*' => 'required|string|max:255',
            'maxGroups' => 'sometimes|integer|min:1|max:100',
            'maxDurationMinutes' => 'sometimes|integer|min:1|max:180',
            'delayBetweenJoinsMs' => 'sometimes|integer|min:500|max:10000',
            'searchDelayMs' => 'sometimes|integer|min:500|max:5000',
            'pageLoadDelayMs' => 'sometimes|integer|min:1000|max:10000',
            'skipJoinedGroups' => 'sometimes|boolean',
            'joinPrivateGroups' => 'sometimes|boolean',
            'scrollToFindJoinButton' => 'sometimes|boolean',
            'maxScrollAttempts' => 'sometimes|integer|min:1|max:20',
        ]);

        Log::info('⚙️ Tạo custom config', [
            'has_links' => isset($validated['groupLinks']),
            'has_names' => isset($validated['groupNames']),
            'max_groups' => $validated['maxGroups'] ?? 10
        ]);

        // Merge với default config
        $config = array_merge([
            'groupLinks' => [],
            'groupNames' => [],
            'maxGroups' => 10,
            'maxDurationMinutes' => 30,
            'delayBetweenJoinsMs' => 3000,
            'searchDelayMs' => 1500,
            'pageLoadDelayMs' => 3000,
            'skipJoinedGroups' => true,
            'joinPrivateGroups' => true,
            'scrollToFindJoinButton' => true,
            'maxScrollAttempts' => 5
        ], $validated);

        return response()->json([
            'success' => true,
            'data' => $config,
            'message' => 'Custom config created successfully'
        ]);
    }

    /**
     * Lấy config cho Single Join Workflow
     * 
     * Trả về cấu hình để join một nhóm đơn lẻ
     * 
     * @bodyParam groupLinkOrName string required Link hoặc tên nhóm
     * @bodyParam isLink boolean Xác định đây là link hay tên nhóm. Default: true
     * 
     * @response {
     *   "groupLinks": ["https://facebook.com/groups/123"],
     *   "groupNames": [],
     *   "maxGroups": 1,
     *   "maxDurationMinutes": 5,
     *   "delayBetweenJoinsMs": 3000,
     *   "searchDelayMs": 1500,
     *   "pageLoadDelayMs": 3000,
     *   "skipJoinedGroups": true,
     *   "joinPrivateGroups": true,
     *   "scrollToFindJoinButton": true,
     *   "maxScrollAttempts": 5
     * }
     */
    public function getSingleJoinConfig(Request $request)
    {
        $validated = $request->validate([
            'groupLinkOrName' => 'required|string',
            'isLink' => 'sometimes|boolean',
        ]);

        $isLink = $validated['isLink'] ?? true;

        Log::info('👤 Tạo config Single Join', [
            'value' => $validated['groupLinkOrName'],
            'is_link' => $isLink
        ]);

        $config = [
            'groupLinks' => $isLink ? [$validated['groupLinkOrName']] : [],
            'groupNames' => !$isLink ? [$validated['groupLinkOrName']] : [],
            'maxGroups' => 1,
            'maxDurationMinutes' => 5,
            'delayBetweenJoinsMs' => 3000,
            'searchDelayMs' => 1500,
            'pageLoadDelayMs' => 3000,
            'skipJoinedGroups' => true,
            'joinPrivateGroups' => true,
            'scrollToFindJoinButton' => true,
            'maxScrollAttempts' => 5
        ];

        return response()->json([
            'success' => true,
            'data' => $config,
            'message' => 'Single join config created successfully'
        ]);
    }

    /**
     * Validate config trước khi gửi đến Android app
     * 
     * Kiểm tra tính hợp lệ của config
     * 
     * @bodyParam config object required Config cần validate
     */
    public function validateConfig(Request $request)
    {
        try {
            $validated = $request->validate([
                'config' => 'required|array',
                'config.groupLinks' => 'sometimes|array',
                'config.groupLinks.*' => 'required|string',
                'config.groupNames' => 'sometimes|array',
                'config.groupNames.*' => 'required|string',
                'config.maxGroups' => 'sometimes|integer|min:1',
                'config.maxDurationMinutes' => 'sometimes|integer|min:1',
                'config.delayBetweenJoinsMs' => 'sometimes|integer|min:0',
                'config.searchDelayMs' => 'sometimes|integer|min:0',
                'config.pageLoadDelayMs' => 'sometimes|integer|min:0',
                'config.skipJoinedGroups' => 'sometimes|boolean',
                'config.joinPrivateGroups' => 'sometimes|boolean',
                'config.scrollToFindJoinButton' => 'sometimes|boolean',
                'config.maxScrollAttempts' => 'sometimes|integer|min:1',
            ]);

            $config = $validated['config'];

            // Validation logic
            $errors = [];

            if (empty($config['groupLinks']) && empty($config['groupNames'])) {
                $errors[] = 'Phải có ít nhất một groupLinks hoặc groupNames';
            }

            if (isset($config['delayBetweenJoinsMs']) && $config['delayBetweenJoinsMs'] < 500) {
                $errors[] = 'delayBetweenJoinsMs nên >= 500ms để tránh bị phát hiện spam';
            }

            if (isset($config['maxGroups']) && isset($config['maxDurationMinutes'])) {
                $estimatedTime = $config['maxGroups'] * ($config['delayBetweenJoinsMs'] ?? 3000) / 1000 / 60;
                if ($estimatedTime > $config['maxDurationMinutes']) {
                    $errors[] = "Thời gian ước tính ({$estimatedTime} phút) vượt quá maxDurationMinutes";
                }
            }

            Log::info('✅ Validate config', [
                'is_valid' => empty($errors),
                'errors_count' => count($errors)
            ]);

            return response()->json([
                'success' => empty($errors),
                'valid' => empty($errors),
                'errors' => $errors,
                'config' => $config,
                'message' => empty($errors) ? 'Config hợp lệ' : 'Config có lỗi'
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'valid' => false,
                'errors' => $e->errors(),
                'message' => 'Validation failed'
            ], 422);
        }
    }
}




<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Proxy;
use App\Services\ProxyService;
use Dedoc\Scramble\Attributes\Group;
use Dedoc\Scramble\Attributes\QueryParameter;
use Illuminate\Http\Request;

/**
 * APIs for managing Proxies.
 * @authenticated
 */
#[Group('Proxy Management')]
class ProxyController extends Controller
{
    protected $proxyService;

    public function __construct(ProxyService $proxyService)
    {
        $this->proxyService = $proxyService;
    }

    /**
     * List all proxies
     *
     * Retrieve a paginated list of all proxies.
     * Supports searching, filtering, and sorting.
     * Admin can see all proxies, regular users can only see their own proxies.
     *
     * @response \Illuminate\Pagination\LengthAwarePaginator<App\Models\Proxy>
     */
    #[QueryParameter('search', description: 'Search proxies by name, host, username, country, city, or notes.', example: 'US proxy')]
    #[QueryParameter('filter[user_id]', description: 'Filter proxies by user ID.', example: 1)]
    #[QueryParameter('filter[type]', description: 'Filter proxies by type (http, https, socks4, socks5).', example: 'http')]
    #[QueryParameter('filter[status]', description: 'Filter proxies by status (active, inactive, error).', example: 'active')]
    #[QueryParameter('filter[country]', description: 'Filter proxies by country.', example: 'United States')]
    #[QueryParameter('sort', description: 'Sort by `name`, `host`, `type`, `status`, `last_used_at`, `created_at`, `updated_at`. Prefix with `-` for descending.', example: '-created_at')]
    #[QueryParameter('page', description: 'The page number for pagination.', example: 1)]
    #[QueryParameter('per_page', description: 'The number of items per page.', example: 15)]
    public function index(Request $request)
    {
        $user = $request->user();
        
        // Nếu user là admin, hiển thị tất cả proxies
        if ($user->hasRole('admin')) {
            return response()->json($this->proxyService->getAll($request));
        }
        
        // Nếu không phải admin, chỉ hiển thị proxies của user đó
        return response()->json($this->proxyService->getForUser($request));
    }

    /**
     * Create a new proxy
     *
     * Creates a new proxy with the given details.
     * Admin can create proxies for any user, regular users can only create for themselves.
     */
    public function store(Request $request)
    {
        $user = $request->user();
        
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'name' => 'required|string|max:255',
            'host' => 'required|string|max:255',
            'port' => 'required|integer|min:1|max:65535',
            'username' => 'nullable|string|max:255',
            'password' => 'nullable|string|max:255',
            'type' => 'required|in:http,https,socks4,socks5',
            'status' => 'sometimes|in:active,inactive,error',
            'country' => 'nullable|string|max:255',
            'city' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
        ]);

        // Kiểm tra quyền: chỉ admin mới có thể tạo proxy cho user khác
        if (!$user->hasRole('admin') && $validated['user_id'] != $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $proxy = $this->proxyService->create($validated);

        return response()->json($proxy, 201);
    }

    /**
     * Get a specific proxy
     *
     * Retrieves the details of a specific proxy by its ID.
     * Admin can see any proxy, regular users can only see their own proxies.
     */
    public function show(Request $request, Proxy $proxy)
    {
        $user = $request->user();
        
        // Kiểm tra quyền: chỉ admin hoặc chủ sở hữu mới có thể xem
        if (!$user->hasRole('admin') && $proxy->user_id != $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return response()->json($proxy->load('user'));
    }

    /**
     * Update a proxy
     *
     * Updates the details of a specific proxy.
     * Admin can update any proxy, regular users can only update their own proxies.
     */
    public function update(Request $request, Proxy $proxy)
    {
        $user = $request->user();
        
        // Kiểm tra quyền: chỉ admin hoặc chủ sở hữu mới có thể cập nhật
        if (!$user->hasRole('admin') && $proxy->user_id != $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'host' => 'sometimes|string|max:255',
            'port' => 'sometimes|integer|min:1|max:65535',
            'username' => 'nullable|string|max:255',
            'password' => 'nullable|string|max:255',
            'type' => 'sometimes|in:http,https,socks4,socks5',
            'status' => 'sometimes|in:active,inactive,error',
            'country' => 'nullable|string|max:255',
            'city' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
        ]);

        $updatedProxy = $this->proxyService->update($proxy, $validated);

        return response()->json($updatedProxy);
    }

    /**
     * Delete a proxy
     *
     * Deletes a specific proxy.
     * Admin can delete any proxy, regular users can only delete their own proxies.
     */
    public function destroy(Request $request, Proxy $proxy)
    {
        $user = $request->user();
        
        // Kiểm tra quyền: chỉ admin hoặc chủ sở hữu mới có thể xóa
        if (!$user->hasRole('admin') && $proxy->user_id != $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $this->proxyService->delete($proxy);

        return response()->json(null, 204);
    }

    /**
     * Test proxy connection
     *
     * Tests the connection of a specific proxy and updates its status.
     * Admin can test any proxy, regular users can only test their own proxies.
     */
    public function testConnection(Request $request, Proxy $proxy)
    {
        $user = $request->user();
        
        // Kiểm tra quyền: chỉ admin hoặc chủ sở hữu mới có thể test
        if (!$user->hasRole('admin') && $proxy->user_id != $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $result = $this->proxyService->testConnection($proxy);

        return response()->json($result);
    }

    /**
     * Get active proxies for current user
     *
     * Returns all active proxies for the authenticated user.
     */
    public function getActiveProxies(Request $request)
    {
        $user = $request->user();
        $proxies = $this->proxyService->getActiveForUser($user->id);

        return response()->json($proxies);
    }

    /**
     * Delete multiple proxies
     *
     * Deletes a list of proxies by their IDs.
     * Admin can delete any proxies, regular users can only delete their own proxies.
     */
    public function bulkDelete(Request $request)
    {
        $user = $request->user();
        
        $validated = $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:proxies,id',
        ]);

        // Kiểm tra quyền cho từng proxy
        $proxies = Proxy::whereIn('id', $validated['ids'])->get();
        foreach ($proxies as $proxy) {
            if (!$user->hasRole('admin') && $proxy->user_id != $user->id) {
                return response()->json(['message' => 'Unauthorized to delete some proxies'], 403);
            }
        }

        $count = $this->proxyService->deleteMultiple($validated['ids']);

        return response()->json(['message' => "Successfully deleted {$count} proxies."]);
    }

    /**
     * Update status for multiple proxies
     *
     * Updates the status for a list of proxies.
     * Admin can update any proxies, regular users can only update their own proxies.
     */
    public function bulkUpdateStatus(Request $request)
    {
        $user = $request->user();
        
        $validated = $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:proxies,id',
            'status' => 'required|string|in:active,inactive,error',
        ]);

        // Kiểm tra quyền cho từng proxy
        $proxies = Proxy::whereIn('id', $validated['ids'])->get();
        foreach ($proxies as $proxy) {
            if (!$user->hasRole('admin') && $proxy->user_id != $user->id) {
                return response()->json(['message' => 'Unauthorized to update some proxies'], 403);
            }
        }

        $count = $this->proxyService->updateStatusMultiple($validated['ids'], $validated['status']);

        return response()->json(['message' => "Successfully updated {$count} proxies to status '{$validated['status']}'."]);
    }

    /**
     * Import proxies from list
     *
     * Imports multiple proxies from provided data.
     * Admin can import for any user, regular users can only import for themselves.
     */
    public function import(Request $request)
    {
        $user = $request->user();
        
        $validated = $request->validate([
            'proxies' => 'required|array',
            'proxies.*.name' => 'sometimes|string|max:255',
            'proxies.*.host' => 'required|string|max:255',
            'proxies.*.port' => 'required|integer|min:1|max:65535',
            'proxies.*.username' => 'nullable|string|max:255',
            'proxies.*.password' => 'nullable|string|max:255',
            'proxies.*.type' => 'sometimes|in:http,https,socks4,socks5',
            'proxies.*.status' => 'sometimes|in:active,inactive,error',
            'proxies.*.country' => 'nullable|string|max:255',
            'proxies.*.city' => 'nullable|string|max:255',
            'proxies.*.notes' => 'nullable|string',
            'user_id' => 'sometimes|exists:users,id',
        ]);

        // Kiểm tra quyền: chỉ admin mới có thể import cho user khác
        if (isset($validated['user_id']) && !$user->hasRole('admin') && $validated['user_id'] != $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Nếu không có user_id, sử dụng user hiện tại
        if (!isset($validated['user_id'])) {
            $validated['user_id'] = $user->id;
        }

        $result = $this->proxyService->importProxies($validated);

        return response()->json([
            'message' => "Import completed. {$result['total_imported']} proxies imported, {$result['total_errors']} errors.",
            'data' => $result
        ]);
    }

    /**
     * Get proxy statistics
     *
     * Returns statistics about proxies including counts, status distribution, etc.
     * Admin can see all statistics, regular users can only see their own statistics.
     */
    public function stats(Request $request)
    {
        $user = $request->user();
        
        // Nếu user là admin và có user_id trong request, lấy stats cho user đó
        if ($user->hasRole('admin') && $request->has('user_id')) {
            $userId = $request->input('user_id');
        } else {
            $userId = $user->id;
        }

        $stats = $this->proxyService->getStatistics($userId);

        return response()->json([
            'data' => $stats
        ]);
    }

    /**
     * Get proxy full URL
     *
     * Returns the full proxy URL for a specific proxy.
     * Admin can access any proxy, regular users can only access their own proxies.
     */
    public function getFullUrl(Request $request, Proxy $proxy)
    {
        $user = $request->user();
        
        // Kiểm tra quyền: chỉ admin hoặc chủ sở hữu mới có thể xem
        if (!$user->hasRole('admin') && $proxy->user_id != $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return response()->json([
            'proxy_id' => $proxy->id,
            'full_url' => $proxy->full_url,
            'type' => $proxy->type,
            'host' => $proxy->host,
            'port' => $proxy->port,
            'has_auth' => !empty($proxy->username) && !empty($proxy->password)
        ]);
    }
}

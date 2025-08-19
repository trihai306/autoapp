<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ContentGroup;
use App\Models\Content;
use App\Services\ContentGroupService;
use Dedoc\Scramble\Attributes\Group;
use Dedoc\Scramble\Attributes\QueryParameter;
use Illuminate\Http\Request;

/**
 * APIs for managing content groups. Requires authentication.
 * @authenticated
 */
#[Group('Content Group Management')]
class ContentGroupController extends Controller
{
    protected $contentGroupService;

    public function __construct(ContentGroupService $contentGroupService)
    {
        $this->contentGroupService = $contentGroupService;
        // Authentication is handled by route middleware
    }

    /**
     * List all content groups
     *
     * Retrieve a paginated list of all content groups.
     * Supports searching, filtering, and sorting.
     *
     * @response \Illuminate\Pagination\LengthAwarePaginator<App\Models\ContentGroup>
     */
    #[QueryParameter('search', description: 'A search term to filter content groups by name.', example: 'video scripts')]
    #[QueryParameter('filter[user_id]', description: 'Filter content groups by user ID.', example: '1')]
    #[QueryParameter('filter[name]', description: 'Filter content groups by name.', example: 'TikTok Scripts')]
    #[QueryParameter('sort', description: 'Sort content groups by `name`, `created_at`, `updated_at`. Prefix with `-` for descending.', example: '-created_at')]
    #[QueryParameter('page', description: 'The page number for pagination.', example: 2)]
    #[QueryParameter('per_page', description: 'The number of items per page.', example: 25)]
    public function index(Request $request)
    {
        // Automatically filter by current user
        $request->merge(['filter' => array_merge($request->get('filter', []), ['user_id' => auth()->id()])]);
        
        // A paginated list of content group resources.
        return response()->json($this->contentGroupService->getAllContentGroups($request));
    }

    /**
     * Create a new content group
     *
     * Creates a new content group with the given details.
     * The new content group object is returned upon successful creation.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            /**
             * The name of the content group.
             * @example TikTok Video Scripts
             */
            'name' => ['required', 'string', 'max:255'],
        ]);

        // Automatically set user_id from authenticated user
        $validated['user_id'] = auth()->id();

        $contentGroup = $this->contentGroupService->createContentGroup($validated);

        // The newly created content group resource.
        return response()->json($contentGroup, 201);
    }

    /**
     * Get a specific content group
     *
     * Retrieves the details of a specific content group by their ID.
     * @param  ContentGroup  $contentGroup The content group model instance.
     */
    public function show(ContentGroup $contentGroup)
    {
        // Check if the content group belongs to the authenticated user
        if ($contentGroup->user_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        
        // The requested content group resource.
        return response()->json($contentGroup->load(['user', 'contents'])->loadCount('contents'));
    }

    /**
     * Update a content group
     *
     * Updates the details of a specific content group.
     * @param  ContentGroup  $contentGroup The content group to update.
     */
    public function update(Request $request, ContentGroup $contentGroup)
    {
        // Check if the content group belongs to the authenticated user
        if ($contentGroup->user_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        
        $validated = $request->validate([
            /**
             * The new name of the content group.
             * @example Updated TikTok Scripts
             */
            'name' => 'sometimes|string|max:255',
        ]);

        $updatedContentGroup = $this->contentGroupService->updateContentGroup($contentGroup, $validated);

        // The updated content group resource.
        return response()->json($updatedContentGroup);
    }

    /**
     * Delete a content group
     *
     * Deletes a specific content group.
     * @param  ContentGroup  $contentGroup The content group to delete.
     */
    public function destroy(ContentGroup $contentGroup)
    {
        // Check if the content group belongs to the authenticated user
        if ($contentGroup->user_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        
        $this->contentGroupService->deleteContentGroup($contentGroup);

        return response()->json(null, 204);
    }

    /**
     * Delete multiple content groups
     *
     * Deletes a list of content groups by their IDs.
     */
    public function bulkDelete(Request $request)
    {
        $validated = $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:content_groups,id',
        ]);

        $count = $this->contentGroupService->deleteMultiple($validated['ids']);

        return response()->json(['message' => "Successfully deleted {$count} content groups."]);
    }

    /**
     * Update multiple content groups
     *
     * Updates multiple content groups with the same data.
     */
    public function bulkUpdate(Request $request)
    {
        $validated = $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:content_groups,id',
            'name' => 'sometimes|string|max:255',
        ]);

        $ids = $validated['ids'];
        unset($validated['ids']);

        $count = $this->contentGroupService->updateMultiple($ids, $validated);

        return response()->json(['message' => "Successfully updated {$count} content groups."]);
    }

    /**
     * Remove contents from a specific group
     *
     * Xóa một hoặc nhiều nội dung thuộc về group chỉ định. Chỉ các nội dung
     * có `content_group_id` trùng với group hiện tại mới bị xóa; nội dung nằm
     * ngoài group sẽ bị bỏ qua.
     *
     * Input (JSON body) – có thể truyền một trong các khóa sau (ít nhất 1 khóa):
     * - names: array<string> (tùy chọn)
     *   Danh sách tên nội dung cần xóa. Mỗi phần tử khớp chính xác với cột `title`.
     * - name: string (tùy chọn)
     *   Tên một nội dung duy nhất cần xóa. Tương đương truyền 1 phần tử trong `names`.
     * - titles: array<string> (tùy chọn)
     *   Đồng nghĩa với `names`. Hỗ trợ để thuận tiện khi client đang dùng khóa này.
     * - title: string (tùy chọn)
     *   Đồng nghĩa với `name`.
     *
     * Quy tắc và hành vi:
     * - Cần cung cấp ít nhất một trong các khóa: `names`, `name`, `titles`, `title`.
     * - Nếu truyền nhiều khóa, tất cả sẽ được gộp lại, loại trùng và loại bỏ phần tử rỗng trước khi xử lý.
     * - Việc so khớp dựa trên cột `title` (so khớp chính xác theo chuỗi được lưu trong DB).
     * - API trả về số lượng bản ghi đã xóa trong trường `deleted`.
     *
     * Ví dụ:
     * {
     *   "names": ["Video A", "Video B"]
     * }
     * Hoặc
     * {
     *   "name": "Video A"
     * }
     */
    public function removeContents(Request $request, ContentGroup $contentGroup)
    {
        // Ensure the group belongs to the authenticated user
        if ($contentGroup->user_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Support deleting by names (preferred) and keep flexible keys
        $request->validate([
            'names' => 'sometimes|array|min:1',
            'names.*' => 'string',
            'name' => 'sometimes|string',
            'titles' => 'sometimes|array|min:1',
            'titles.*' => 'string',
            'title' => 'sometimes|string',
        ]);

        $names = [];
        if ($request->filled('names')) {
            $names = array_merge($names, $request->input('names'));
        }
        if ($request->filled('titles')) {
            $names = array_merge($names, $request->input('titles'));
        }
        if ($request->filled('name')) {
            $names[] = $request->input('name');
        }
        if ($request->filled('title')) {
            $names[] = $request->input('title');
        }

        // Normalize and deduplicate
        $names = array_values(array_unique(array_filter($names, function ($v) {
            return !is_null($v) && $v !== '';
        })));

        if (count($names) === 0) {
            return response()->json(['message' => 'No names provided'], 422);
        }

        // Delete contents that match both the names (title) and the group
        $deleted = Content::where('content_group_id', $contentGroup->id)
            ->whereIn('title', $names)
            ->delete();

        return response()->json([
            'message' => "Deleted {$deleted} contents from the group.",
            'deleted' => $deleted,
        ]);
    }
}

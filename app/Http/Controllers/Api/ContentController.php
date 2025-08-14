<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Content;
use App\Services\ContentService;
use Dedoc\Scramble\Attributes\Group;
use Dedoc\Scramble\Attributes\QueryParameter;
use Illuminate\Http\Request;

/**
 * APIs for managing contents. Requires authentication.
 * @authenticated
 */
#[Group('Content Management')]
class ContentController extends Controller
{
    protected $contentService;

    public function __construct(ContentService $contentService)
    {
        $this->contentService = $contentService;
        // Authentication is handled by route middleware
    }

    /**
     * List all contents
     *
     * Retrieve a paginated list of all contents.
     * Supports searching, filtering, and sorting.
     *
     * @response \Illuminate\Pagination\LengthAwarePaginator<App\Models\Content>
     */
    #[QueryParameter('search', description: 'A search term to filter contents by title.', example: 'tiktok video')]
    #[QueryParameter('filter[user_id]', description: 'Filter contents by user ID.', example: '1')]
    #[QueryParameter('filter[content_group_id]', description: 'Filter contents by content group ID.', example: '1')]
    #[QueryParameter('filter[title]', description: 'Filter contents by title.', example: 'TikTok Script #1')]
    #[QueryParameter('sort', description: 'Sort contents by `title`, `created_at`, `updated_at`. Prefix with `-` for descending.', example: '-created_at')]
    #[QueryParameter('page', description: 'The page number for pagination.', example: 2)]
    #[QueryParameter('per_page', description: 'The number of items per page.', example: 25)]
    public function index(Request $request)
    {
        // Automatically filter by current user
        $request->merge(['filter' => array_merge($request->get('filter', []), ['user_id' => auth()->id()])]);
        
        // A paginated list of content resources.
        return response()->json($this->contentService->getAllContents($request));
    }

    /**
     * List contents by content group
     *
     * Retrieve a paginated list of contents for a specific content group.
     *
     * @response \Illuminate\Pagination\LengthAwarePaginator<App\Models\Content>
     */
    #[QueryParameter('search', description: 'A search term to filter contents by title.', example: 'tiktok video')]
    #[QueryParameter('sort', description: 'Sort contents by `title`, `created_at`, `updated_at`. Prefix with `-` for descending.', example: '-created_at')]
    #[QueryParameter('page', description: 'The page number for pagination.', example: 2)]
    #[QueryParameter('per_page', description: 'The number of items per page.', example: 25)]
    public function getByGroup(Request $request, $groupId)
    {
        // Check if the content group belongs to the authenticated user
        $contentGroup = \App\Models\ContentGroup::find($groupId);
        if (!$contentGroup || $contentGroup->user_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        
        // A paginated list of content resources for the specified group.
        $request->merge(['filter' => ['content_group_id' => $groupId, 'user_id' => auth()->id()]]);
        return response()->json($this->contentService->getAllContents($request));
    }

    /**
     * Create a new content
     *
     * Creates a new content with the given details.
     * The new content object is returned upon successful creation.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            /**
             * The ID of the content group (optional).
             * @example 1
             */
            'content_group_id' => ['nullable', 'integer', 'exists:content_groups,id'],
            /**
             * The title of the content.
             * @example TikTok Video Script #1
             */
            'title' => ['required', 'string', 'max:255'],
            /**
             * The content data in JSON format or string.
             * @example {"script": "Hello everyone...", "duration": 30, "tags": ["funny", "trending"]}
             */
            'content' => ['required'],
        ]);

        // Automatically set user_id from authenticated user
        $validated['user_id'] = auth()->id();

        // Convert content to array if it's a string
        if (is_string($validated['content'])) {
            $validated['content'] = ['text' => $validated['content']];
        }

        $content = $this->contentService->createContent($validated);

        // The newly created content resource.
        return response()->json($content, 201);
    }

    /**
     * Get a specific content
     *
     * Retrieves the details of a specific content by their ID.
     * @param  Content  $content The content model instance.
     */
    public function show(Content $content)
    {
        // The requested content resource.
        return response()->json($content->load(['user', 'contentGroup']));
    }

    /**
     * Update a content
     *
     * Updates the details of a specific content.
     * @param  Content  $content The content to update.
     */
    public function update(Request $request, Content $content)
    {
        $validated = $request->validate([
            /**
             * The new content group ID (optional).
             * @example 2
             */
            'content_group_id' => 'nullable|integer|exists:content_groups,id',
            /**
             * The new title of the content.
             * @example Updated TikTok Script
             */
            'title' => 'sometimes|string|max:255',
            /**
             * The new content data in JSON format.
             * @example {"script": "Updated script...", "duration": 45, "tags": ["updated", "trending"]}
             */
            'content' => 'sometimes|array',
        ]);

        $updatedContent = $this->contentService->updateContent($content, $validated);

        // The updated content resource.
        return response()->json($updatedContent);
    }

    /**
     * Delete a content
     *
     * Deletes a specific content.
     * @param  Content  $content The content to delete.
     */
    public function destroy(Content $content)
    {
        $this->contentService->deleteContent($content);

        return response()->json(null, 204);
    }

    /**
     * Delete multiple contents
     *
     * Deletes a list of contents by their IDs.
     */
    public function bulkDelete(Request $request)
    {
        $validated = $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:contents,id',
        ]);

        $count = $this->contentService->deleteMultiple($validated['ids']);

        return response()->json(['message' => "Successfully deleted {$count} contents."]);
    }

    /**
     * Update multiple contents
     *
     * Updates multiple contents with the same data.
     */
    public function bulkUpdate(Request $request)
    {
        $validated = $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:contents,id',
            'content_group_id' => 'nullable|integer|exists:content_groups,id',
            'title' => 'sometimes|string|max:255',
            'content' => 'sometimes|array',
        ]);

        $ids = $validated['ids'];
        unset($validated['ids']);

        $count = $this->contentService->updateMultiple($ids, $validated);

        return response()->json(['message' => "Successfully updated {$count} contents."]);
    }
}

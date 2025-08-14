<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\Notification\NotificationService;
use Dedoc\Scramble\Attributes\Group;
use Dedoc\Scramble\Attributes\QueryParameter;
use Illuminate\Http\Request;

/**
 * @authenticated
 */
#[Group('Notifications')]
class NotificationController extends Controller
{
    protected $notificationService;

    public function __construct(NotificationService $notificationService)
    {
        $this->notificationService = $notificationService;
    }

    /**
     * Get all notifications
     *
     * Retrieve a paginated list of the authenticated user's notifications.
     * Supports filtering and sorting.
     *
     * @response \Illuminate\Pagination\LengthAwarePaginator<\Illuminate\Notifications\DatabaseNotification>
     */
    #[QueryParameter('filter[type]', description: 'Filter notifications by type.', example: 'App\\Notifications\\NewDeposit')]
    #[QueryParameter('filter[read_at]', description: 'Filter by read status. Use `null` for unread, and `not-null` for read.', example: 'null')]
    #[QueryParameter('sort', description: 'Sort notifications by `created_at`. Prefix with `-` for descending.', example: '-created_at')]
    #[QueryParameter('page', description: 'The page number for pagination.', example: 1)]
    #[QueryParameter('per_page', description: 'The number of items per page.', example: 15)]
    public function getUserNotifications(Request $request)
    {
        $notifications = $this->notificationService->getUserNotifications($request);
        return response()->json($notifications);
    }

    /**
     * Mark a notification as read
     *
     * @param string $id The ID of the notification.
     */
    public function markAsRead(string $id)
    {
        $this->notificationService->markAsRead($id);
        return response()->json(['message' => 'Notification marked as read.']);
    }

    /**
     * Mark all notifications as read
     */
    public function markAllAsRead()
    {
        $this->notificationService->markAllAsRead();
        return response()->json(['message' => 'All notifications marked as read.']);
    }

    /**
     * List all notifications (Admin)
     *
     * @response \Illuminate\Pagination\LengthAwarePaginator<\App\Models\Notification>
     */
    public function index(Request $request)
    {
        $notifications = $this->notificationService->getAllNotifications($request);
        return response()->json($notifications);
    }

    /**
     * Get a specific notification (Admin)
     * @response \App\Models\Notification
     */
    public function show(string $id)
    {
        $notification = $this->notificationService->getNotificationById($id);
        return response()->json($notification);
    }

    /**
     * Delete a notification (Admin)
     */
    public function destroy(string $id)
    {
        $this->notificationService->deleteNotification($id);
        return response()->json(null, 204);
    }

    /**
     * Delete multiple notifications (Admin)
     */
    public function bulkDelete(Request $request)
    {
        $validated = $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:notifications,id',
        ]);

        $count = $this->notificationService->deleteMultipleNotifications($validated['ids']);
        return response()->json(['message' => "Successfully deleted {$count} notifications."]);
    }
}

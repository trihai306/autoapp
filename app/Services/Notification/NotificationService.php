<?php

namespace App\Services\Notification;

use App\Queries\BaseQuery;
use App\Repositories\Notification\NotificationRepositoryInterface;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class NotificationService
{
    protected $notificationRepository;

    public function __construct(NotificationRepositoryInterface $notificationRepository)
    {
        $this->notificationRepository = $notificationRepository;
    }

    public function getUserNotifications(Request $request)
    {
        $query = Auth::user()->notifications();

        if (!$request->has('sort')) {
            $query->latest();
        }

        return BaseQuery::for($query, $request)->paginate();
    }

    public function markAsRead(string $notificationId): bool
    {
        $notification = Auth::user()->notifications()->find($notificationId);
        if ($notification) {
            return $notification->markAsRead();
        }
        return false;
    }

    public function markAllAsRead()
    {
        return Auth::user()->unreadNotifications->markAsRead();
    }

    public function getAllNotifications(Request $request)
    {
        // Assuming notifications are stored in a 'notifications' table and have a model
        $query = $this->notificationRepository->getModel()->query();

        if (!$request->has('sort')) {
            $query->latest();
        }

        return BaseQuery::for($query, $request)->paginate();
    }

    public function getNotificationById(string $id)
    {
        return $this->notificationRepository->find($id);
    }

    public function deleteNotification(string $id): bool
    {
        return $this->notificationRepository->delete($id);
    }

    public function deleteMultipleNotifications(array $ids): int
    {
        return $this->notificationRepository->deleteByIds($ids);
    }
}

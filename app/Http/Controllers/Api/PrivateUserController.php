<?php

namespace App\Http\Controllers\Api;

use App\Events\UserNotification;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PrivateUserController extends Controller
{
    /**
     * Gửi notification đến private-user channel
     */
    public function sendNotification(Request $request)
    {
        $request->validate([
            'user_id' => 'required|integer|exists:users,id',
            'title' => 'required|string|max:255',
            'message' => 'required|string',
            'type' => 'string|in:info,success,warning,error'
        ]);

        $notification = [
            'id' => uniqid(),
            'title' => $request->input('title'),
            'message' => $request->input('message'),
            'type' => $request->input('type', 'info'),
            'from_user_id' => Auth::id(),
        ];

        $userId = $request->input('user_id');

        // Broadcast event đến private-user channel
        event(new UserNotification($notification, $userId));

        return response()->json([
            'success' => true,
            'message' => 'Notification sent to private-user channel successfully',
            'notification' => $notification,
            'channel' => "private-user.{$userId}",
            'event' => 'user.notification'
        ]);
    }

    /**
     * Test kết nối private-user channel
     */
    public function testConnection(Request $request)
    {
        $userId = $request->input('user_id', Auth::id());
        
        return response()->json([
            'success' => true,
            'message' => 'Private-user channel connection test',
            'user_id' => $userId,
            'channel' => "private-user.{$userId}",
            'event' => 'user.notification',
            'auth_user_id' => Auth::id(),
            'can_access' => Auth::id() == $userId
        ]);
    }
}

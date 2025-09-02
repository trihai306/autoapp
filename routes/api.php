<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\TransactionController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\AISpendingHistoryController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\RoleController;
use App\Http\Controllers\Api\PermissionController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\TransactionAnalyticController;
use App\Http\Controllers\Api\SettingController;
use App\Http\Controllers\Api\InteractionScenarioController;
use App\Http\Controllers\Api\ScenarioScriptController;
use App\Http\Controllers\Api\AccountTaskController;
use App\Http\Controllers\Api\DeviceController;
use App\Http\Controllers\Api\ContentGroupController;
use App\Http\Controllers\Api\ContentController;
use App\Http\Controllers\Api\ProxyController;
use App\Http\Controllers\RealtimeTestController;
use App\Http\Controllers\Api\PrivateUserController;
use Illuminate\Support\Facades\Broadcast;
// Auth routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/reset-password', [AuthController::class, 'resetPassword']);

// Token-based authentication routes
Route::post('/generate-login-token', [AuthController::class, 'generateLoginToken']);
Route::post('/login-with-token', [AuthController::class, 'loginWithToken']);


// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/profile', [AuthController::class, 'getProfile']);
    Route::get('/profile/permissions', [AuthController::class, 'getUserPermissions']);
    Route::post('/profile/settings', [ProfileController::class, 'update']);
    Route::post('/profile/change-password', [ProfileController::class, 'changePassword']);
    Route::post('/profile/avatar', [ProfileController::class, 'updateAvatar']);

    // Settings routes
    Route::get('/settings', [SettingController::class, 'index']);
    Route::post('/settings', [SettingController::class, 'update']);

    // Transaction routes (User)
    Route::post('/deposit', [TransactionController::class, 'deposit']);
    Route::post('/topup-intent', [TransactionController::class, 'topupIntent']);
    Route::post('/withdrawal', [TransactionController::class, 'withdrawal']);
    Route::get('/my-transactions', [TransactionController::class, 'getUserHistory']);

    // Transaction routes (Admin)
    Route::get('transactions/stats', [TransactionController::class, 'stats']);
    Route::apiResource('transactions', TransactionController::class)->except(['store', 'update']);
    Route::post('transactions/{transaction}/approve', [TransactionController::class, 'approve']);
    Route::post('transactions/{transaction}/reject', [TransactionController::class, 'reject']);
    Route::post('transactions/bulk-delete', [TransactionController::class, 'bulkDelete']);

    // Notification routes (User)
    Route::get('/my-notifications', [NotificationController::class, 'getUserNotifications']);
    Route::patch('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
    Route::post('/notifications/mark-all-as-read', [NotificationController::class, 'markAllAsRead']);

    // Notification routes (Admin)
    Route::apiResource('notifications', NotificationController::class)->except(['store', 'update'])
        ->middleware('permission:notifications.view');
    Route::post('notifications/bulk-delete', [NotificationController::class, 'bulkDelete'])
        ->middleware('permission:notifications.bulk-operations');

    // AI Spending History routes
    Route::post('/ai-spending-history', [AISpendingHistoryController::class, 'recordUsage']);
    Route::get('/ai-spending-history', [AISpendingHistoryController::class, 'getUserHistory']);
    Route::get('/ai-spending-history/feature', [AISpendingHistoryController::class, 'getFeatureHistory']);
    Route::get('/ai-spending-history/model', [AISpendingHistoryController::class, 'getModelHistory']);
    
    // Roles, Permissions, and User Management
    Route::get('roles/stats', [RoleController::class, 'stats'])
        ->middleware('permission:roles.view');
    Route::apiResource('roles', RoleController::class)->middleware('permission:roles.view');
    Route::post('roles/bulk-delete', [RoleController::class, 'bulkDelete'])
        ->middleware('permission:roles.bulk-operations');
    Route::apiResource('permissions', PermissionController::class)->middleware('permission:permissions.view');
    Route::post('permissions/bulk-delete', [PermissionController::class, 'bulkDelete'])
        ->middleware('permission:permissions.bulk-operations');
    Route::get('users/stats', [UserController::class, 'stats'])
        ->middleware('permission:users.view');
    Route::apiResource('users', UserController::class)->middleware('permission:users.view');
    Route::post('users/{user}/assign-role', [UserController::class, 'assignRole'])
        ->middleware('permission:users.assign-roles');
    Route::post('users/bulk-delete', [UserController::class, 'bulkDelete'])
        ->middleware('permission:users.bulk-operations');
    Route::post('users/bulk-update-status', [UserController::class, 'bulkUpdateStatus'])
        ->middleware('permission:users.bulk-operations');

    // Interaction Scenarios, Scripts, and Tasks
    Route::apiResource('interaction-scenarios', InteractionScenarioController::class);
    Route::apiResource('scenario-scripts', ScenarioScriptController::class);
    Route::apiResource('account-tasks', AccountTaskController::class);
    
    // Account tasks recent activities
    Route::post('account-tasks/recent-activities', [AccountTaskController::class, 'getRecentActivities']);
    

    
    // Device specific routes (must come before resource routes)
    Route::post('devices/bulk-delete', [DeviceController::class, 'bulkDelete']);
    Route::post('devices/bulk-update-status', [DeviceController::class, 'bulkUpdateStatus']);
    Route::get('devices/stats', [DeviceController::class, 'stats']);
    Route::get('devices/recent-activities', [DeviceController::class, 'recentActivities']);
    Route::post('devices/import', [DeviceController::class, 'import']);
    Route::get('devices/{device}/connected-accounts', [DeviceController::class, 'getConnectedAccounts']);
    
    // Device resource routes (must come after specific routes)
    Route::apiResource('devices', DeviceController::class);
    Route::get('tiktok-accounts/stats', [\App\Http\Controllers\Api\TiktokAccountController::class, 'stats']);
    Route::get('tiktok-accounts/task-analysis', [\App\Http\Controllers\Api\TiktokAccountController::class, 'taskAnalysis']);
    Route::get('tiktok-accounts/recent-activities', [\App\Http\Controllers\Api\TiktokAccountController::class, 'recentActivities']);
    Route::get('tiktok-accounts/{tiktokAccount}/activity-history', [\App\Http\Controllers\Api\TiktokAccountController::class, 'activityHistory']);
    // 2FA management routes for TikTok accounts
    Route::post('tiktok-accounts/{tiktokAccount}/enable-2fa', [\App\Http\Controllers\Api\TiktokAccountController::class, 'enable2FA']);
    Route::post('tiktok-accounts/{tiktokAccount}/disable-2fa', [\App\Http\Controllers\Api\TiktokAccountController::class, 'disable2FA']);
    Route::post('tiktok-accounts/{tiktokAccount}/regenerate-backup-codes', [\App\Http\Controllers\Api\TiktokAccountController::class, 'regenerateBackupCodes']);
    
    // File upload and post creation routes for TikTok accounts
    Route::post('tiktok-accounts/{tiktokAccount}/upload-file', [\App\Http\Controllers\Api\TiktokAccountController::class, 'uploadFile']);
    Route::post('tiktok-accounts/{tiktokAccount}/create-post', [\App\Http\Controllers\Api\TiktokAccountController::class, 'createPost']);
    Route::post('tiktok-accounts/{tiktokAccount}/update-avatar', [\App\Http\Controllers\Api\TiktokAccountController::class, 'updateAvatar']);
    Route::apiResource('tiktok-accounts', \App\Http\Controllers\Api\TiktokAccountController::class);
    // Run linked scenario for a TikTok account -> create account tasks from scenario scripts
    Route::post('tiktok-accounts/{tiktokAccount}/run-scenario', [\App\Http\Controllers\Api\TiktokAccountController::class, 'runScenario']);
    Route::post('tiktok-accounts/bulk-delete', [\App\Http\Controllers\Api\TiktokAccountController::class, 'bulkDelete']);
    Route::post('tiktok-accounts/bulk-update-status', [\App\Http\Controllers\Api\TiktokAccountController::class, 'bulkUpdateStatus']);
    Route::post('tiktok-accounts/delete-pending-tasks', [\App\Http\Controllers\Api\TiktokAccountController::class, 'deletePendingTasks']);
    Route::post('tiktok-accounts/import', [\App\Http\Controllers\Api\TiktokAccountController::class, 'import']);

    // Proxy Management
    Route::get('proxies/active', [ProxyController::class, 'getActiveProxies']);
    Route::get('proxies/active-for-select', [ProxyController::class, 'getActiveProxiesForSelect']);
    Route::get('proxies/stats', [ProxyController::class, 'stats']);
    Route::post('proxies/bulk-delete', [ProxyController::class, 'bulkDelete']);
    Route::post('proxies/bulk-update-status', [ProxyController::class, 'bulkUpdateStatus']);
    Route::post('proxies/import', [ProxyController::class, 'import']);
    Route::post('proxies/{proxy}/test-connection', [ProxyController::class, 'testConnection']);
    Route::get('proxies/{proxy}/full-url', [ProxyController::class, 'getFullUrl']);
    Route::apiResource('proxies', ProxyController::class);

    // Content Management
    Route::apiResource('content-groups', ContentGroupController::class);
    Route::post('content-groups/bulk-delete', [ContentGroupController::class, 'bulkDelete']);
    Route::post('content-groups/bulk-update', [ContentGroupController::class, 'bulkUpdate']);
    Route::post('content-groups/{contentGroup}/remove-contents', [ContentGroupController::class, 'removeContents']);
    
    // Get contents by group
    Route::get('content-groups/{groupId}/contents', [ContentController::class, 'getByGroup']);
    
    Route::apiResource('contents', ContentController::class);
    Route::post('contents/bulk-delete', [ContentController::class, 'bulkDelete']);
    Route::post('contents/bulk-update', [ContentController::class, 'bulkUpdate']);

    // Analytics
    Route::get('/analytic/transactions', TransactionAnalyticController::class)
        ->middleware('permission:analytics.transactions');


});

Route::prefix('app')->group(function () {
    Route::post('/devices', [\App\Http\Controllers\Api\Devices\DeviceController::class, 'store']);

    // Account tasks for devices
    Route::get('/devices/{device}/tasks', [\App\Http\Controllers\Api\Devices\AccountTaskController::class, 'pendingForDevice']);
    Route::post('/tasks/{task}/status', [\App\Http\Controllers\Api\Devices\AccountTaskController::class, 'updateStatus']);
})->middleware('auth:sanctum');
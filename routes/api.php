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
use App\Http\Controllers\Api\ServicePackageController;
use App\Http\Controllers\Api\ServicePackageCategoryController;
use App\Http\Controllers\Api\ServicePackageTierController;
use App\Http\Controllers\Api\ServicePackagePaymentController;
use App\Http\Controllers\RealtimeTestController;
use App\Http\Controllers\Api\PrivateUserController;
use Illuminate\Support\Facades\Broadcast;
// Auth routes with rate limiting
Route::post('/register', [AuthController::class, 'register'])->middleware('rate.limit:5,15'); // 5 attempts per 15 minutes
Route::post('/login', [AuthController::class, 'login'])->middleware('rate.limit:10,5'); // 10 attempts per 5 minutes
Route::post('/forgot-password', [AuthController::class, 'forgotPassword'])->middleware('rate.limit:3,60'); // 3 attempts per hour
Route::post('/reset-password', [AuthController::class, 'resetPassword'])->middleware('rate.limit:5,15'); // 5 attempts per 15 minutes

// Broadcasting authentication for API
Route::post('/broadcasting/auth', function (Request $request) {
    return app(\Illuminate\Broadcasting\BroadcastController::class)->authenticate($request);
})->middleware('auth:sanctum');

// Token-based authentication routes
Route::post('/generate-login-token', [AuthController::class, 'generateLoginToken']);
Route::post('/login-with-token', [AuthController::class, 'loginWithToken']);


// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Auth routes
    Route::post('/refresh-token', [AuthController::class, 'refreshToken']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/profile', [AuthController::class, 'getProfile']);
    Route::get('/profile/permissions', [AuthController::class, 'getUserPermissions']);
    Route::post('/profile/settings', [ProfileController::class, 'update']);
    Route::post('/profile/change-password', [ProfileController::class, 'changePassword']);
    Route::post('/profile/avatar', [ProfileController::class, 'updateAvatar']);

    // Generic file upload
    Route::post('/files/upload', [\App\Http\Controllers\Api\FileController::class, 'upload']);

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
    // Facebook Accounts
    Route::get('facebook-accounts/stats', [\App\Http\Controllers\Api\FacebookAccountController::class, 'stats']);
    Route::post('facebook-accounts/import', [\App\Http\Controllers\Api\FacebookAccountController::class, 'import']);
    Route::patch('facebook-accounts/{facebookAccount}/connection-type', [\App\Http\Controllers\Api\FacebookAccountController::class, 'updateConnectionType']);
    Route::get('facebook-accounts/{facebookAccount}/activities', [\App\Http\Controllers\Api\FacebookAccountController::class, 'activityHistory']);
    Route::post('facebook-accounts/connection-type/bulk', [\App\Http\Controllers\Api\FacebookAccountController::class, 'bulkUpdateConnectionType']);
    Route::post('facebook-accounts/{facebookAccount}/run-scenario', [\App\Http\Controllers\Api\FacebookAccountController::class, 'runScenario'])->whereNumber('facebookAccount');
    Route::post('facebook-accounts/{facebookAccount}/stop-tasks', [\App\Http\Controllers\Api\FacebookAccountController::class, 'stopTasks'])->whereNumber('facebookAccount');
    Route::post('facebook-accounts/{facebookAccount}/assign-scenario', [\App\Http\Controllers\Api\FacebookAccountController::class, 'assignScenario'])->whereNumber('facebookAccount');
    Route::post('facebook-accounts/{facebookAccount}/stop-scenario', [\App\Http\Controllers\Api\FacebookAccountController::class, 'stopScenario'])->whereNumber('facebookAccount');
    Route::post('facebook-accounts/run-scenario/bulk', [\App\Http\Controllers\Api\FacebookAccountController::class, 'bulkRunScenario']);
    Route::post('facebook-accounts/stop-tasks/bulk', [\App\Http\Controllers\Api\FacebookAccountController::class, 'bulkStopTasks']);
    Route::post('facebook-accounts/bulk-run', [\App\Http\Controllers\Api\FacebookAccountController::class, 'bulkRun']);
    // New bulk endpoints per plan
    Route::post('facebook-accounts/bulk/delete', [\App\Http\Controllers\Api\FacebookAccountController::class, 'bulkDelete']);
    Route::post('facebook-accounts/bulk/run', [\App\Http\Controllers\Api\FacebookAccountController::class, 'bulkRunV2']);
    Route::post('facebook-accounts/bulk/stop-scenario', [\App\Http\Controllers\Api\FacebookAccountController::class, 'bulkStopScenario']);
    Route::post('facebook-accounts/bulk/assign-scenario', [\App\Http\Controllers\Api\FacebookAccountController::class, 'bulkAssignScenario']);
    Route::post('facebook-accounts/bulk/assign-device', [\App\Http\Controllers\Api\FacebookAccountController::class, 'bulkAssignDevice']);
        Route::get('facebook-accounts/{facebookAccount}/tasks', [\App\Http\Controllers\Api\FacebookAccountController::class, 'getAccountTasks']);
        Route::get('facebook-accounts/{facebookAccount}/status', [\App\Http\Controllers\Api\FacebookAccountController::class, 'getAccountStatus']);
        Route::get('facebook-accounts/tasks/all', [\App\Http\Controllers\Api\FacebookAccountController::class, 'getAllTasks']);
        Route::get('facebook-accounts/status/all', [\App\Http\Controllers\Api\FacebookAccountController::class, 'getAllAccountsStatus']);
        Route::get('facebook-accounts/batch-data', [\App\Http\Controllers\Api\FacebookAccountController::class, 'getBatchData']);
    Route::apiResource('facebook-accounts', \App\Http\Controllers\Api\FacebookAccountController::class);
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
    Route::patch('tiktok-accounts/{tiktokAccount}/update-proxy', [\App\Http\Controllers\Api\TiktokAccountController::class, 'updateProxy']);
    Route::patch('tiktok-accounts/{tiktokAccount}/connection-type', [\App\Http\Controllers\Api\TiktokAccountController::class, 'updateConnectionType']);
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

    // Service Package Management
    Route::get('/service-packages/popular', [ServicePackageController::class, 'popular']);
    Route::post('/service-packages/compare', [ServicePackageController::class, 'compare']);
    Route::get('/service-packages/stats', [ServicePackageController::class, 'stats']);
    Route::post('/service-packages/bulk-delete', [ServicePackageController::class, 'bulkDelete']);
    Route::post('/service-packages/bulk-update-status', [ServicePackageController::class, 'bulkUpdateStatus']);
    Route::get('/service-packages/search', [ServicePackageController::class, 'search']);
    Route::get('/service-packages/category/{id}/packages', [ServicePackageController::class, 'byCategory']);
    Route::get('/service-packages/platform/{platform}', [ServicePackageController::class, 'byPlatform']);
    Route::get('/service-packages/{id}/with-tiers', [ServicePackageController::class, 'withTiers']);
    Route::post('/service-packages/{id}/recommend-tier', [ServicePackageController::class, 'recommendTier']);
    Route::apiResource('service-packages', ServicePackageController::class);

    // Service Package Categories
    Route::get('/service-package-categories/{id}/packages', [ServicePackageCategoryController::class, 'packages']);
    Route::get('/service-package-categories/{id}/packages-with-tiers', [ServicePackageCategoryController::class, 'packagesWithTiers']);
    Route::get('/service-package-categories/{id}/packages-by-platform/{platform}', [ServicePackageCategoryController::class, 'packagesByPlatform']);
    Route::apiResource('service-package-categories', ServicePackageCategoryController::class);

    // Service Package Tiers
    Route::get('/service-package-tiers/package/{packageId}', [ServicePackageTierController::class, 'byPackage']);
    Route::get('/service-package-tiers/device-limit/{deviceLimit}', [ServicePackageTierController::class, 'byDeviceLimit']);
    Route::post('/service-package-tiers/recommend', [ServicePackageTierController::class, 'recommend']);
    Route::apiResource('service-package-tiers', ServicePackageTierController::class);

    // Service Package Payment routes
    Route::post('/service-packages/purchase', [ServicePackagePaymentController::class, 'purchase']);
    Route::get('/service-packages/my-subscriptions', [ServicePackagePaymentController::class, 'getUserSubscriptions']);
    Route::get('/service-packages/current-subscription', [ServicePackagePaymentController::class, 'getCurrentSubscription']);
    Route::post('/service-packages/extend', [ServicePackagePaymentController::class, 'extendSubscription']);
    Route::post('/service-packages/cancel', [ServicePackagePaymentController::class, 'cancelSubscription']);

});

Route::prefix('app')->group(function () {
    Route::post('/devices', [\App\Http\Controllers\Api\Devices\DeviceController::class, 'store']);

    // Account tasks for devices
    Route::get('/devices/{device}/tasks', [\App\Http\Controllers\Api\Devices\AccountTaskController::class, 'pendingForDevice']);
    Route::post('/tasks/{task}/status', [\App\Http\Controllers\Api\Devices\AccountTaskController::class, 'updateStatus']);
})->middleware('auth:sanctum');

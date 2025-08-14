<?php

require_once 'vendor/autoload.php';

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

// Cấu hình cơ bản
$baseUrl = 'http://autoapp.test';
$testToken = null;

echo "🚀 Bắt đầu test Broadcasting...\n\n";

// 1. Test đăng nhập để lấy token
echo "1️⃣ Test đăng nhập...\n";
try {
    $loginResponse = Http::post($baseUrl . '/api/login', [
        'email' => 'admin@example.com', // Thay đổi email thực tế
        'password' => 'password' // Thay đổi password thực tế
    ]);

    if ($loginResponse->successful()) {
        $loginData = $loginResponse->json();
        $testToken = $loginData['data']['token'] ?? null;
        echo "✅ Đăng nhập thành công\n";
        echo "   Token: " . substr($testToken, 0, 20) . "...\n\n";
    } else {
        echo "❌ Đăng nhập thất bại: " . $loginResponse->status() . "\n";
        echo "   Response: " . $loginResponse->body() . "\n\n";
        exit(1);
    }
} catch (Exception $e) {
    echo "❌ Lỗi đăng nhập: " . $e->getMessage() . "\n\n";
    exit(1);
}

// 2. Test broadcasting auth endpoint
echo "2️⃣ Test Broadcasting Auth Endpoint...\n";
try {
    $authResponse = Http::withHeaders([
        'Authorization' => 'Bearer ' . $testToken,
        'Accept' => 'application/json',
        'Content-Type' => 'application/json'
    ])->post($baseUrl . '/api/broadcasting/auth', [
        'socket_id' => 'test_socket_id_123',
        'channel_name' => 'private-App.Models.User.1'
    ]);

    echo "   Status: " . $authResponse->status() . "\n";
    echo "   Response: " . $authResponse->body() . "\n\n";

    if ($authResponse->successful()) {
        echo "✅ Broadcasting auth thành công\n\n";
    } else {
        echo "❌ Broadcasting auth thất bại\n\n";
    }
} catch (Exception $e) {
    echo "❌ Lỗi broadcasting auth: " . $e->getMessage() . "\n\n";
}

// 3. Test realtime test endpoint
echo "3️⃣ Test Realtime Test Endpoint...\n";
try {
    $testResponse = Http::withHeaders([
        'Authorization' => 'Bearer ' . $testToken,
        'Accept' => 'application/json',
        'Content-Type' => 'application/json'
    ])->post($baseUrl . '/api/realtime/test-broadcasting-auth');

    echo "   Status: " . $testResponse->status() . "\n";
    echo "   Response: " . $testResponse->body() . "\n\n";

    if ($testResponse->successful()) {
        echo "✅ Realtime test thành công\n\n";
    } else {
        echo "❌ Realtime test thất bại\n\n";
    }
} catch (Exception $e) {
    echo "❌ Lỗi realtime test: " . $e->getMessage() . "\n\n";
}

// 4. Test gửi notification
echo "4️⃣ Test Gửi Notification...\n";
try {
    $notificationResponse = Http::withHeaders([
        'Authorization' => 'Bearer ' . $testToken,
        'Accept' => 'application/json',
        'Content-Type' => 'application/json'
    ])->post($baseUrl . '/api/realtime/send-test-notification', [
        'title' => 'Test từ Script',
        'message' => 'Đây là notification test từ script PHP',
        'type' => 'info'
    ]);

    echo "   Status: " . $notificationResponse->status() . "\n";
    echo "   Response: " . $notificationResponse->body() . "\n\n";

    if ($notificationResponse->successful()) {
        echo "✅ Gửi notification thành công\n\n";
    } else {
        echo "❌ Gửi notification thất bại\n\n";
    }
} catch (Exception $e) {
    echo "❌ Lỗi gửi notification: " . $e->getMessage() . "\n\n";
}

// 5. Test connection info
echo "5️⃣ Test Connection Info...\n";
try {
    $infoResponse = Http::withHeaders([
        'Authorization' => 'Bearer ' . $testToken,
        'Accept' => 'application/json'
    ])->get($baseUrl . '/api/realtime/connection-info');

    echo "   Status: " . $infoResponse->status() . "\n";
    echo "   Response: " . $infoResponse->body() . "\n\n";

    if ($infoResponse->successful()) {
        echo "✅ Lấy connection info thành công\n\n";
    } else {
        echo "❌ Lấy connection info thất bại\n\n";
    }
} catch (Exception $e) {
    echo "❌ Lỗi connection info: " . $e->getMessage() . "\n\n";
}

echo "🏁 Hoàn thành test Broadcasting!\n";
echo "\n📝 Hướng dẫn debug:\n";
echo "1. Kiểm tra log Laravel: tail -f storage/logs/laravel.log\n";
echo "2. Kiểm tra Reverb server: php artisan reverb:start\n";
echo "3. Kiểm tra browser console để xem Echo logs\n";
echo "4. Test WebSocket connection: wscat -c ws://127.0.0.1:8080\n";

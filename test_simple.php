<?php

// Test đơn giản cho Broadcasting
echo "🧪 Test Broadcasting Đơn Giản\n\n";

// 1. Test endpoint cơ bản
echo "1. Test endpoint cơ bản...\n";
$url = 'http://autoapp.test/api/realtime/connection-info';
$response = file_get_contents($url);
echo "Response: " . $response . "\n\n";

// 2. Test với curl
echo "2. Test với curl...\n";
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'http://autoapp.test/api/realtime/test-broadcasting-auth');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Accept: application/json',
    'Content-Type: application/json'
]);
$result = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "HTTP Code: " . $httpCode . "\n";
echo "Response: " . $result . "\n\n";

// 3. Test WebSocket connection
echo "3. Test WebSocket connection...\n";
$wsUrl = 'ws://127.0.0.1:8080';
echo "WebSocket URL: " . $wsUrl . "\n";
echo "Kiểm tra xem Reverb server có đang chạy không...\n\n";

// 4. Test broadcasting auth endpoint
echo "4. Test broadcasting auth endpoint...\n";
$authUrl = 'http://autoapp.test/api/broadcasting/auth';
$authData = json_encode([
    'socket_id' => 'test_socket_123',
    'channel_name' => 'private-App.Models.User.1'
]);

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $authUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $authData);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Accept: application/json',
    'Content-Type: application/json'
]);
$authResult = curl_exec($ch);
$authHttpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "Auth HTTP Code: " . $authHttpCode . "\n";
echo "Auth Response: " . $authResult . "\n\n";

echo "✅ Hoàn thành test!\n";

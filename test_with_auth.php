<?php

// Test Broadcasting với Authentication
echo "🔐 Test Broadcasting với Authentication\n\n";

// 1. Đăng nhập để lấy token
echo "1. Đăng nhập...\n";
$loginData = json_encode([
    'login' => 'admin@example.com',
    'password' => 'password' // Thay đổi nếu cần
]);

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'http://autoapp.test/api/login');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $loginData);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Accept: application/json',
    'Content-Type: application/json'
]);
$loginResult = curl_exec($ch);
$loginHttpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "Login HTTP Code: " . $loginHttpCode . "\n";
echo "Login Response: " . $loginResult . "\n\n";

if ($loginHttpCode !== 200) {
    echo "❌ Đăng nhập thất bại!\n";
    exit(1);
}

$loginResponse = json_decode($loginResult, true);
$token = $loginResponse['token'] ?? null;

if (!$token) {
    echo "❌ Không lấy được token!\n";
    exit(1);
}

echo "✅ Đăng nhập thành công! Token: " . substr($token, 0, 20) . "...\n\n";

// 2. Test broadcasting auth endpoint với token
echo "2. Test Broadcasting Auth Endpoint...\n";
$authData = json_encode([
    'socket_id' => '617704227.478040580',
    'channel_name' => 'private-App.Models.User.1'
]);

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'http://autoapp.test/api/broadcasting/auth');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $authData);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Accept: application/json',
    'Content-Type: application/json',
    'Authorization: Bearer ' . $token
]);
$authResult = curl_exec($ch);
$authHttpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "Auth HTTP Code: " . $authHttpCode . "\n";
echo "Auth Response: " . $authResult . "\n\n";

if ($authHttpCode === 200) {
    echo "✅ Broadcasting auth thành công!\n\n";
} else {
    echo "❌ Broadcasting auth thất bại!\n\n";
}

// 3. Test realtime test endpoint
echo "3. Test Realtime Test Endpoint...\n";
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'http://autoapp.test/api/realtime/test-broadcasting-auth');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Accept: application/json',
    'Content-Type: application/json',
    'Authorization: Bearer ' . $token
]);
$testResult = curl_exec($ch);
$testHttpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "Test HTTP Code: " . $testHttpCode . "\n";
echo "Test Response: " . $testResult . "\n\n";

if ($testHttpCode === 200) {
    echo "✅ Realtime test thành công!\n\n";
} else {
    echo "❌ Realtime test thất bại!\n\n";
}

// 4. Test gửi notification
echo "4. Test Gửi Notification...\n";
$notificationData = json_encode([
    'title' => 'Test từ Script PHP',
    'message' => 'Đây là notification test từ script PHP',
    'type' => 'info'
]);

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'http://autoapp.test/api/realtime/send-test-notification');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $notificationData);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Accept: application/json',
    'Content-Type: application/json',
    'Authorization: Bearer ' . $token
]);
$notificationResult = curl_exec($ch);
$notificationHttpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "Notification HTTP Code: " . $notificationHttpCode . "\n";
echo "Notification Response: " . $notificationResult . "\n\n";

if ($notificationHttpCode === 200) {
    echo "✅ Gửi notification thành công!\n\n";
} else {
    echo "❌ Gửi notification thất bại!\n\n";
}

// 5. Test connection info
echo "5. Test Connection Info...\n";
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'http://autoapp.test/api/realtime/connection-info');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Accept: application/json',
    'Authorization: Bearer ' . $token
]);
$infoResult = curl_exec($ch);
$infoHttpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "Info HTTP Code: " . $infoHttpCode . "\n";
echo "Info Response: " . $infoResult . "\n\n";

if ($infoHttpCode === 200) {
    echo "✅ Lấy connection info thành công!\n\n";
} else {
    echo "❌ Lấy connection info thất bại!\n\n";
}

echo "🏁 Hoàn thành test!\n";
echo "\n📝 Kết quả:\n";
echo "- Broadcasting Auth: " . ($authHttpCode === 200 ? "✅" : "❌") . "\n";
echo "- Realtime Test: " . ($testHttpCode === 200 ? "✅" : "❌") . "\n";
echo "- Send Notification: " . ($notificationHttpCode === 200 ? "✅" : "❌") . "\n";
echo "- Connection Info: " . ($infoHttpCode === 200 ? "✅" : "❌") . "\n";

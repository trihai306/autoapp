# Facebook Join Group API - Testing Guide

Hướng dẫn test các API endpoints cho Facebook Join Group Workflow.

## 📋 Prerequisites

1. **Authentication Token**: Bạn cần có Sanctum Bearer Token
2. **Base URL**: `http://localhost:8000/api` (hoặc domain của bạn)
3. **Headers cần thiết**:
   ```
   Authorization: Bearer YOUR_ACCESS_TOKEN
   Content-Type: application/json
   Accept: application/json
   ```

## 🔑 Lấy Access Token

### Option 1: Login qua API

```bash
curl -X POST "http://localhost:8000/api/login" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

Response:
```json
{
  "token": "1|abcdef123456...",
  "user": { ... }
}
```

### Option 2: Dùng token có sẵn từ database

```sql
SELECT * FROM personal_access_tokens WHERE tokenable_id = YOUR_USER_ID;
```

## 🧪 Test Cases

### 1. Get Default Config

**Request:**
```bash
curl -X GET "http://localhost:8000/api/app/facebook/join-group/config/default" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Accept: application/json"
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "groupLinks": [],
    "groupNames": [],
    "maxGroups": 10,
    "maxDurationMinutes": 30,
    "delayBetweenJoinsMs": 3000,
    "searchDelayMs": 1500,
    "pageLoadDelayMs": 3000,
    "skipJoinedGroups": true,
    "joinPrivateGroups": true,
    "scrollToFindJoinButton": true,
    "maxScrollAttempts": 5
  },
  "message": "Default config retrieved successfully"
}
```

**Check Laravel Log:**
```bash
tail -f storage/logs/laravel.log
```

Expected log:
```
[2025-10-13 10:30:45] local.INFO: 📋 Lấy default config cho Facebook Join Group
```

---

### 2. Join by Links Config

**Valid Request:**
```bash
curl -X POST "http://localhost:8000/api/app/facebook/join-group/config/join-by-links" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "groupLinks": [
      "https://facebook.com/groups/123456789",
      "https://facebook.com/groups/987654321"
    ],
    "maxGroups": 5,
    "maxDurationMinutes": 15
  }'
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "groupLinks": [
      "https://facebook.com/groups/123456789",
      "https://facebook.com/groups/987654321"
    ],
    "groupNames": [],
    "maxGroups": 5,
    "maxDurationMinutes": 15,
    "delayBetweenJoinsMs": 3000,
    "searchDelayMs": 1500,
    "pageLoadDelayMs": 3000,
    "skipJoinedGroups": true,
    "joinPrivateGroups": true,
    "scrollToFindJoinButton": true,
    "maxScrollAttempts": 5
  },
  "message": "Join by links config created successfully"
}
```

**Invalid Request (Missing groupLinks):**
```bash
curl -X POST "http://localhost:8000/api/app/facebook/join-group/config/join-by-links" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "maxGroups": 5
  }'
```

**Expected Response (422 Unprocessable Entity):**
```json
{
  "message": "The group links field is required.",
  "errors": {
    "groupLinks": [
      "The group links field is required."
    ]
  }
}
```

**Invalid URL:**
```bash
curl -X POST "http://localhost:8000/api/app/facebook/join-group/config/join-by-links" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "groupLinks": ["not-a-valid-url"]
  }'
```

**Expected Response (422):**
```json
{
  "message": "The group links.0 must be a valid URL.",
  "errors": {
    "groupLinks.0": [
      "The group links.0 must be a valid URL."
    ]
  }
}
```

---

### 3. Join by Search Config

**Valid Request:**
```bash
curl -X POST "http://localhost:8000/api/app/facebook/join-group/config/join-by-search" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "groupNames": [
      "React Developers Vietnam",
      "Laravel Vietnam Community"
    ],
    "maxGroups": 8,
    "maxDurationMinutes": 20
  }'
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "groupLinks": [],
    "groupNames": [
      "React Developers Vietnam",
      "Laravel Vietnam Community"
    ],
    "maxGroups": 8,
    "maxDurationMinutes": 20,
    "delayBetweenJoinsMs": 3000,
    "searchDelayMs": 1500,
    "pageLoadDelayMs": 3000,
    "skipJoinedGroups": true,
    "joinPrivateGroups": true,
    "scrollToFindJoinButton": true,
    "maxScrollAttempts": 5
  },
  "message": "Join by search config created successfully"
}
```

---

### 4. Fast Join Config

**Request:**
```bash
curl -X POST "http://localhost:8000/api/app/facebook/join-group/config/fast-join" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "groupLinks": [
      "https://facebook.com/groups/quickjoin123"
    ],
    "maxGroups": 3
  }'
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "groupLinks": ["https://facebook.com/groups/quickjoin123"],
    "groupNames": [],
    "maxGroups": 3,
    "maxDurationMinutes": 10,
    "delayBetweenJoinsMs": 1000,
    "searchDelayMs": 1000,
    "pageLoadDelayMs": 2000,
    "skipJoinedGroups": true,
    "joinPrivateGroups": true,
    "scrollToFindJoinButton": true,
    "maxScrollAttempts": 5
  },
  "message": "Fast join config created successfully"
}
```

**Check delays are shorter:**
- `delayBetweenJoinsMs`: 1000 (thay vì 3000)
- `searchDelayMs`: 1000 (thay vì 1500)
- `pageLoadDelayMs`: 2000 (thay vì 3000)

---

### 5. Single Join Config

**Request (with link):**
```bash
curl -X POST "http://localhost:8000/api/app/facebook/join-group/config/single-join" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "groupLinkOrName": "https://facebook.com/groups/singlejoin123",
    "isLink": true
  }'
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "groupLinks": ["https://facebook.com/groups/singlejoin123"],
    "groupNames": [],
    "maxGroups": 1,
    "maxDurationMinutes": 5,
    "delayBetweenJoinsMs": 3000,
    "searchDelayMs": 1500,
    "pageLoadDelayMs": 3000,
    "skipJoinedGroups": true,
    "joinPrivateGroups": true,
    "scrollToFindJoinButton": true,
    "maxScrollAttempts": 5
  },
  "message": "Single join config created successfully"
}
```

**Request (with name):**
```bash
curl -X POST "http://localhost:8000/api/app/facebook/join-group/config/single-join" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "groupLinkOrName": "React Developers",
    "isLink": false
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "groupLinks": [],
    "groupNames": ["React Developers"],
    "maxGroups": 1,
    ...
  }
}
```

---

### 6. Custom Config

**Request:**
```bash
curl -X POST "http://localhost:8000/api/app/facebook/join-group/config/custom" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "groupLinks": ["https://facebook.com/groups/custom1"],
    "groupNames": ["Custom Group 2"],
    "maxGroups": 15,
    "maxDurationMinutes": 40,
    "delayBetweenJoinsMs": 2000,
    "searchDelayMs": 1000,
    "pageLoadDelayMs": 2500,
    "skipJoinedGroups": false,
    "joinPrivateGroups": true,
    "scrollToFindJoinButton": false,
    "maxScrollAttempts": 8
  }'
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "groupLinks": ["https://facebook.com/groups/custom1"],
    "groupNames": ["Custom Group 2"],
    "maxGroups": 15,
    "maxDurationMinutes": 40,
    "delayBetweenJoinsMs": 2000,
    "searchDelayMs": 1000,
    "pageLoadDelayMs": 2500,
    "skipJoinedGroups": false,
    "joinPrivateGroups": true,
    "scrollToFindJoinButton": false,
    "maxScrollAttempts": 8
  },
  "message": "Custom config created successfully"
}
```

**Test validation limits:**
```bash
curl -X POST "http://localhost:8000/api/app/facebook/join-group/config/custom" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "maxGroups": 200,
    "delayBetweenJoinsMs": 100
  }'
```

**Expected Response (422):**
```json
{
  "message": "The max groups must not be greater than 100.",
  "errors": {
    "maxGroups": ["The max groups must not be greater than 100."],
    "delayBetweenJoinsMs": ["The delay between joins ms must be at least 500."]
  }
}
```

---

### 7. Validate Config

**Valid Config:**
```bash
curl -X POST "http://localhost:8000/api/app/facebook/join-group/config/validate" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "config": {
      "groupLinks": ["https://facebook.com/groups/123"],
      "maxGroups": 10,
      "maxDurationMinutes": 20,
      "delayBetweenJoinsMs": 3000
    }
  }'
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "valid": true,
  "errors": [],
  "config": {
    "groupLinks": ["https://facebook.com/groups/123"],
    "maxGroups": 10,
    "maxDurationMinutes": 20,
    "delayBetweenJoinsMs": 3000
  },
  "message": "Config hợp lệ"
}
```

**Invalid Config (no links/names):**
```bash
curl -X POST "http://localhost:8000/api/app/facebook/join-group/config/validate" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "config": {
      "maxGroups": 10
    }
  }'
```

**Expected Response (200 OK but invalid):**
```json
{
  "success": false,
  "valid": false,
  "errors": [
    "Phải có ít nhất một groupLinks hoặc groupNames"
  ],
  "config": { ... },
  "message": "Config có lỗi"
}
```

**Config with timing issues:**
```bash
curl -X POST "http://localhost:8000/api/app/facebook/join-group/config/validate" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "config": {
      "groupLinks": ["https://facebook.com/groups/123"],
      "maxGroups": 20,
      "maxDurationMinutes": 1,
      "delayBetweenJoinsMs": 10000
    }
  }'
```

**Expected Response:**
```json
{
  "success": false,
  "valid": false,
  "errors": [
    "Thời gian ước tính (3.33 phút) vượt quá maxDurationMinutes"
  ],
  "config": { ... },
  "message": "Config có lỗi"
}
```

---

## 🔒 Authentication Tests

### Test without token (401)

```bash
curl -X GET "http://localhost:8000/api/app/facebook/join-group/config/default" \
  -H "Accept: application/json"
```

**Expected Response (401 Unauthorized):**
```json
{
  "message": "Unauthenticated."
}
```

### Test with invalid token (401)

```bash
curl -X GET "http://localhost:8000/api/app/facebook/join-group/config/default" \
  -H "Authorization: Bearer invalid_token_123" \
  -H "Accept: application/json"
```

**Expected Response (401):**
```json
{
  "message": "Unauthenticated."
}
```

---

## 📊 Postman Collection

### Import vào Postman

1. Tạo Collection: "Facebook Join Group API"
2. Add các requests theo mẫu trên
3. Set Environment Variables:
   - `base_url`: `http://localhost:8000/api`
   - `token`: `YOUR_ACCESS_TOKEN`

### Request Template (Postman)

**Headers:**
```
Authorization: Bearer {{token}}
Content-Type: application/json
Accept: application/json
```

**Pre-request Script (optional):**
```javascript
// Auto refresh token nếu hết hạn
if (!pm.environment.get("token")) {
    console.log("No token found, please login first");
}
```

**Tests Script:**
```javascript
// Test status code
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

// Test response structure
pm.test("Response has success field", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('success');
});

// Test config structure
pm.test("Config has required fields", function () {
    var jsonData = pm.response.json();
    var config = jsonData.data;
    pm.expect(config).to.have.property('groupLinks');
    pm.expect(config).to.have.property('maxGroups');
    pm.expect(config).to.have.property('delayBetweenJoinsMs');
});

// Log response
console.log("Response:", pm.response.json());
```

---

## 🐛 Debug & Troubleshooting

### Check Laravel Logs

```bash
# Real-time log monitoring
tail -f storage/logs/laravel.log

# Grep specific logs
grep "Facebook Join Group" storage/logs/laravel.log

# Lọc theo level
grep "ERROR" storage/logs/laravel.log
```

### Common Issues

**1. 401 Unauthorized**
- Kiểm tra token có đúng không
- Token có hết hạn không (check `expires_at` trong DB)
- Header `Authorization` đúng format: `Bearer YOUR_TOKEN`

**2. 422 Validation Error**
- Check request body format (JSON hợp lệ)
- Đảm bảo các field required có đủ
- Kiểm tra kiểu dữ liệu (string, int, boolean)

**3. 500 Internal Server Error**
- Check Laravel log: `tail -f storage/logs/laravel.log`
- Kiểm tra database connection
- Verify controller code syntax

**4. CORS Error (khi test từ browser)**
- Thêm domain vào `config/cors.php`
- Clear cache: `php artisan config:clear`

### Debug Request/Response

**Enable query logging:**
```php
// Thêm vào Controller
\DB::enableQueryLog();
// ... your code ...
\Log::info('Queries:', \DB::getQueryLog());
```

**Log request data:**
```php
\Log::info('Request data:', $request->all());
```

---

## ✅ Checklist kiểm tra API

- [ ] GET default config - 200 OK
- [ ] POST join by links - valid request - 200 OK
- [ ] POST join by links - missing groupLinks - 422
- [ ] POST join by links - invalid URL - 422
- [ ] POST join by search - valid request - 200 OK
- [ ] POST fast join - valid request - 200 OK
- [ ] POST single join - with link - 200 OK
- [ ] POST single join - with name - 200 OK
- [ ] POST custom config - valid - 200 OK
- [ ] POST custom config - exceed limits - 422
- [ ] POST validate - valid config - 200 OK, valid=true
- [ ] POST validate - invalid config - 200 OK, valid=false
- [ ] All endpoints - without token - 401
- [ ] All endpoints - invalid token - 401
- [ ] Check Laravel logs có log đúng format

---

## 📈 Performance Testing

### Test với nhiều requests đồng thời

```bash
# Sử dụng Apache Bench
ab -n 100 -c 10 -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8000/api/app/facebook/join-group/config/default

# Hoặc sử dụng hey
hey -n 100 -c 10 -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8000/api/app/facebook/join-group/config/default
```

### Expected Performance
- Response time: < 100ms
- Success rate: 100%
- No 500 errors

---

## 🎯 Integration Test Script

```bash
#!/bin/bash

TOKEN="YOUR_ACCESS_TOKEN"
BASE_URL="http://localhost:8000/api"

echo "Testing Facebook Join Group API..."

# Test 1: Default Config
echo "1. Testing default config..."
curl -s -X GET "$BASE_URL/app/facebook/join-group/config/default" \
  -H "Authorization: Bearer $TOKEN" | jq '.success'

# Test 2: Join by Links
echo "2. Testing join by links..."
curl -s -X POST "$BASE_URL/app/facebook/join-group/config/join-by-links" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"groupLinks":["https://facebook.com/groups/123"]}' | jq '.success'

# Test 3: Validate
echo "3. Testing validate..."
curl -s -X POST "$BASE_URL/app/facebook/join-group/config/validate" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"config":{"groupLinks":["https://facebook.com/groups/123"]}}' | jq '.valid'

echo "All tests completed!"
```

**Run script:**
```bash
chmod +x test_api.sh
./test_api.sh
```

Expected output:
```
Testing Facebook Join Group API...
1. Testing default config...
true
2. Testing join by links...
true
3. Testing validate...
true
All tests completed!
```




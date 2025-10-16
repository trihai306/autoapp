# Facebook Join Group Config API

API để trả về cấu hình (config) cho Android App thực hiện workflow Join Group Facebook.

## 📋 Mục lục

- [Endpoints](#endpoints)
- [Config Schema](#config-schema)
- [Ví dụ sử dụng](#ví-dụ-sử-dụng)
- [Response Format](#response-format)

## 🔗 Endpoints

Tất cả endpoints yêu cầu authentication (`auth:sanctum`)

Base URL: `/api/app/facebook/join-group`

### 1. Lấy Default Config

```
GET /api/app/facebook/join-group/config/default
```

Trả về cấu hình mặc định cơ bản.

**Response:**
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

### 2. Join by Links Config

```
POST /api/app/facebook/join-group/config/join-by-links
```

Tạo config để join nhóm qua danh sách links.

**Request Body:**
```json
{
  "groupLinks": [
    "https://facebook.com/groups/123456789",
    "https://facebook.com/groups/987654321"
  ],
  "maxGroups": 10,
  "maxDurationMinutes": 20
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "groupLinks": [
      "https://facebook.com/groups/123456789",
      "https://facebook.com/groups/987654321"
    ],
    "groupNames": [],
    "maxGroups": 10,
    "maxDurationMinutes": 20,
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

### 3. Join by Search Config

```
POST /api/app/facebook/join-group/config/join-by-search
```

Tạo config để join nhóm qua tìm kiếm tên nhóm.

**Request Body:**
```json
{
  "groupNames": [
    "React Developers Vietnam",
    "Laravel Vietnam Community"
  ],
  "maxGroups": 10,
  "maxDurationMinutes": 25
}
```

### 4. Fast Join Config

```
POST /api/app/facebook/join-group/config/fast-join
```

Tạo config tối ưu cho join nhanh (delay ngắn hơn).

**Request Body:**
```json
{
  "groupLinks": [
    "https://facebook.com/groups/123456789"
  ],
  "maxGroups": 5
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "groupLinks": ["https://facebook.com/groups/123456789"],
    "groupNames": [],
    "maxGroups": 5,
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

### 5. Single Join Config

```
POST /api/app/facebook/join-group/config/single-join
```

Tạo config để join một nhóm đơn lẻ.

**Request Body:**
```json
{
  "groupLinkOrName": "https://facebook.com/groups/123456789",
  "isLink": true
}
```

hoặc

```json
{
  "groupLinkOrName": "React Developers Vietnam",
  "isLink": false
}
```

### 6. Custom Config

```
POST /api/app/facebook/join-group/config/custom
```

Tạo config tùy chỉnh hoàn toàn với tất cả tham số.

**Request Body:**
```json
{
  "groupLinks": ["https://facebook.com/groups/123"],
  "groupNames": ["Laravel Vietnam"],
  "maxGroups": 15,
  "maxDurationMinutes": 40,
  "delayBetweenJoinsMs": 2000,
  "searchDelayMs": 1000,
  "pageLoadDelayMs": 2500,
  "skipJoinedGroups": true,
  "joinPrivateGroups": false,
  "scrollToFindJoinButton": true,
  "maxScrollAttempts": 8
}
```

### 7. Validate Config

```
POST /api/app/facebook/join-group/config/validate
```

Kiểm tra tính hợp lệ của config trước khi sử dụng.

**Request Body:**
```json
{
  "config": {
    "groupLinks": ["https://facebook.com/groups/123"],
    "maxGroups": 10,
    "maxDurationMinutes": 20,
    "delayBetweenJoinsMs": 3000
  }
}
```

**Response:**
```json
{
  "success": true,
  "valid": true,
  "errors": [],
  "config": { /* validated config */ },
  "message": "Config hợp lệ"
}
```

## 📦 Config Schema

### JoinGroupConfig

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `groupLinks` | `String[]` | No | `[]` | Danh sách links nhóm cần join |
| `groupNames` | `String[]` | No | `[]` | Danh sách tên nhóm để tìm kiếm |
| `maxGroups` | `Integer` | No | `10` | Số nhóm tối đa cần join |
| `maxDurationMinutes` | `Integer` | No | `30` | Thời gian tối đa (phút) |
| `delayBetweenJoinsMs` | `Long` | No | `3000` | Delay giữa các lần join (ms) |
| `searchDelayMs` | `Long` | No | `1500` | Delay sau khi search (ms) |
| `pageLoadDelayMs` | `Long` | No | `3000` | Delay chờ page load (ms) |
| `skipJoinedGroups` | `Boolean` | No | `true` | Bỏ qua nhóm đã join |
| `joinPrivateGroups` | `Boolean` | No | `true` | Join cả nhóm riêng tư |
| `scrollToFindJoinButton` | `Boolean` | No | `true` | Scroll để tìm nút Join |
| `maxScrollAttempts` | `Integer` | No | `5` | Số lần scroll tối đa |

### Validation Rules

- Phải có ít nhất một trong `groupLinks` hoặc `groupNames`
- `maxGroups`: 1-100
- `maxDurationMinutes`: 1-180
- `delayBetweenJoinsMs`: khuyến nghị >= 500ms
- `searchDelayMs`: 500-5000ms
- `pageLoadDelayMs`: 1000-10000ms
- `maxScrollAttempts`: 1-20

## 🔧 Ví dụ sử dụng

### Kotlin (Android App)

```kotlin
// 1. Gọi API để lấy config
suspend fun getJoinGroupConfig(groupLinks: List<String>): JoinGroupConfig? {
    return try {
        val response = apiService.getJoinByLinksConfig(
            JoinByLinksRequest(
                groupLinks = groupLinks,
                maxGroups = 10,
                maxDurationMinutes = 20
            )
        )
        
        if (response.success) {
            response.data
        } else {
            null
        }
    } catch (e: Exception) {
        Log.e("API", "Error getting config", e)
        null
    }
}

// 2. Sử dụng config với workflow
suspend fun executeWorkflow(groupLinks: List<String>) {
    val config = getJoinGroupConfig(groupLinks) ?: return
    
    val workflow = FacebookJoinGroupWorkflow(accessibilityService)
    val result = workflow.executeJoinGroupWorkflow(config)
    
    if (result) {
        Log.i("Workflow", "Join group workflow completed successfully")
    }
}
```

### cURL Examples

**Lấy default config:**
```bash
curl -X GET "http://localhost:8000/api/app/facebook/join-group/config/default" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Accept: application/json"
```

**Join by links:**
```bash
curl -X POST "http://localhost:8000/api/app/facebook/join-group/config/join-by-links" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "groupLinks": [
      "https://facebook.com/groups/123456789"
    ],
    "maxGroups": 5
  }'
```

**Validate config:**
```bash
curl -X POST "http://localhost:8000/api/app/facebook/join-group/config/validate" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "config": {
      "groupLinks": ["https://facebook.com/groups/123"],
      "maxGroups": 10,
      "delayBetweenJoinsMs": 3000
    }
  }'
```

## 📝 Response Format

Tất cả endpoints trả về format chuẩn:

**Success:**
```json
{
  "success": true,
  "data": { /* config object */ },
  "message": "Success message"
}
```

**Error:**
```json
{
  "success": false,
  "message": "Error message",
  "errors": { /* validation errors */ }
}
```

## 🔒 Authentication

Tất cả endpoints yêu cầu Bearer Token (Sanctum):

```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

## 📊 Logging

API tự động log các hoạt động quan trọng vào `storage/logs/laravel.log`:

- ✅ Config được tạo thành công
- ❌ Validation errors
- 🔍 Chi tiết request parameters

Ví dụ log:
```
[2025-10-13 10:30:45] local.INFO: 🔗 Tạo config Join by Links {"links_count":2,"max_groups":10}
[2025-10-13 10:31:20] local.INFO: ✅ Validate config {"is_valid":true,"errors_count":0}
```

## 🚀 Best Practices

1. **Luôn validate config trước khi gửi đến app**
   ```kotlin
   val isValid = apiService.validateConfig(config)
   if (!isValid) return
   ```

2. **Sử dụng Fast Join cho số lượng nhỏ**
   - Fast Join tối ưu cho <= 5 nhóm
   - Delay ngắn hơn, hoàn thành nhanh

3. **Respect rate limits**
   - `delayBetweenJoinsMs` >= 500ms
   - Tránh spam để không bị Facebook phát hiện

4. **Handle errors gracefully**
   ```kotlin
   try {
       val config = getConfig()
       executeWorkflow(config)
   } catch (e: Exception) {
       // Log và thông báo user
   }
   ```

5. **Log kết quả workflow**
   - Gửi logs về server để tracking
   - Debug khi có vấn đề

## ❓ FAQ

**Q: Có thể join bao nhiêu nhóm cùng lúc?**
A: Tối đa 100 nhóm, nhưng khuyến nghị <= 20 để tránh bị Facebook phát hiện.

**Q: Delay tối thiểu là bao nhiêu?**
A: Khuyến nghị >= 500ms cho `delayBetweenJoinsMs` để an toàn.

**Q: Config có được lưu trong database không?**
A: Không, config chỉ được generate và trả về, không lưu trữ.

**Q: Làm sao biết config có hợp lệ?**
A: Sử dụng endpoint `/config/validate` để kiểm tra trước.




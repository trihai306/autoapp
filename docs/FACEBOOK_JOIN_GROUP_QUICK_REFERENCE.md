# Facebook Join Group API - Quick Reference Card

## 🔗 Endpoints Cheat Sheet

Base: `/api/app/facebook/join-group/config`

| Endpoint | Method | Mô tả | Body Required |
|----------|--------|-------|---------------|
| `/default` | GET | Lấy config mặc định | ❌ |
| `/join-by-links` | POST | Config join qua links | ✅ |
| `/join-by-search` | POST | Config join qua search | ✅ |
| `/fast-join` | POST | Config join nhanh | ✅ |
| `/single-join` | POST | Config join 1 nhóm | ✅ |
| `/custom` | POST | Config tùy chỉnh | ✅ |
| `/validate` | POST | Validate config | ✅ |

**Headers (tất cả requests):**
```
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json
Accept: application/json
```

## 📦 Config Schema

```typescript
{
  groupLinks: string[]           // Links nhóm
  groupNames: string[]           // Tên nhóm search
  maxGroups: number              // 1-100
  maxDurationMinutes: number     // 1-180
  delayBetweenJoinsMs: number    // >= 500
  searchDelayMs: number          // 500-5000
  pageLoadDelayMs: number        // 1000-10000
  skipJoinedGroups: boolean      // true/false
  joinPrivateGroups: boolean     // true/false
  scrollToFindJoinButton: boolean// true/false
  maxScrollAttempts: number      // 1-20
}
```

## 🚀 cURL Examples (Copy & Paste)

### 1. Get Default Config
```bash
curl -X GET "http://localhost:8000/api/app/facebook/join-group/config/default" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 2. Join by Links
```bash
curl -X POST "http://localhost:8000/api/app/facebook/join-group/config/join-by-links" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "groupLinks": ["https://facebook.com/groups/123"],
    "maxGroups": 10
  }'
```

### 3. Join by Search
```bash
curl -X POST "http://localhost:8000/api/app/facebook/join-group/config/join-by-search" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "groupNames": ["React Developers"],
    "maxGroups": 5
  }'
```

### 4. Fast Join
```bash
curl -X POST "http://localhost:8000/api/app/facebook/join-group/config/fast-join" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "groupLinks": ["https://facebook.com/groups/123"],
    "maxGroups": 3
  }'
```

### 5. Single Join
```bash
curl -X POST "http://localhost:8000/api/app/facebook/join-group/config/single-join" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "groupLinkOrName": "https://facebook.com/groups/123",
    "isLink": true
  }'
```

### 6. Custom Config
```bash
curl -X POST "http://localhost:8000/api/app/facebook/join-group/config/custom" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "groupLinks": ["https://facebook.com/groups/123"],
    "maxGroups": 15,
    "delayBetweenJoinsMs": 2000
  }'
```

### 7. Validate Config
```bash
curl -X POST "http://localhost:8000/api/app/facebook/join-group/config/validate" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "config": {
      "groupLinks": ["https://facebook.com/groups/123"],
      "maxGroups": 10
    }
  }'
```

## 🎯 Kotlin Quick Code

### Get Config
```kotlin
val config = repository.getJoinByLinksConfig(
    groupLinks = listOf("https://facebook.com/groups/123"),
    maxGroups = 10
).getOrNull()
```

### Run Workflow
```kotlin
val workflow = FacebookJoinGroupWorkflow(accessibilityService)
val result = workflow.executeJoinGroupWorkflow(config.toWorkflowConfig())
```

### With Validation
```kotlin
val isValid = repository.validateConfig(config).getOrNull() ?: false
if (isValid) {
    workflow.executeJoinGroupWorkflow(config.toWorkflowConfig())
}
```

## 📊 Response Format

### Success
```json
{
  "success": true,
  "data": { /* config */ },
  "message": "Success message"
}
```

### Error (422)
```json
{
  "message": "Validation error",
  "errors": {
    "field": ["Error message"]
  }
}
```

### Validation Response
```json
{
  "success": true,
  "valid": true,
  "errors": [],
  "config": { /* config */ },
  "message": "Config hợp lệ"
}
```

## 🔑 Authentication

### Get Token
```bash
curl -X POST "http://localhost:8000/api/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}'
```

### Use Token
```
Authorization: Bearer 1|abcdef123456...
```

## ⚙️ Default Values

| Field | Default | Fast Join | Single Join |
|-------|---------|-----------|-------------|
| maxGroups | 10 | 5 | 1 |
| maxDurationMinutes | 30 | 10 | 5 |
| delayBetweenJoinsMs | 3000 | 1000 | 3000 |
| searchDelayMs | 1500 | 1000 | 1500 |
| pageLoadDelayMs | 3000 | 2000 | 3000 |

## 🐛 Common Errors

| Status | Error | Fix |
|--------|-------|-----|
| 401 | Unauthorized | Check token |
| 422 | Validation failed | Check request body |
| 500 | Server error | Check Laravel log |

## 📝 Validation Rules

✅ **Required**: Ít nhất 1 trong `groupLinks` hoặc `groupNames`  
✅ **URLs**: `groupLinks` phải là URLs hợp lệ  
✅ **Delays**: `delayBetweenJoinsMs` >= 500ms  
✅ **Limits**: `maxGroups` <= 100, `maxDurationMinutes` <= 180  
✅ **Timing**: Estimated time <= maxDurationMinutes

## 🔍 Debug Commands

```bash
# View routes
php artisan route:list --path=facebook

# Monitor logs
tail -f storage/logs/laravel.log

# Clear cache
php artisan config:clear
php artisan route:clear
```

## 📦 Import Postman

File: `docs/Facebook_Join_Group_API.postman_collection.json`

Variables cần set:
- `base_url`: http://localhost:8000/api
- `token`: YOUR_ACCESS_TOKEN

## 🎯 Use Cases

**Case 1**: Join 10 nhóm qua links → `/join-by-links`  
**Case 2**: Tìm và join nhóm → `/join-by-search`  
**Case 3**: Join nhanh 3-5 nhóm → `/fast-join`  
**Case 4**: Join 1 nhóm đơn → `/single-join`  
**Case 5**: Tùy chỉnh hoàn toàn → `/custom`  
**Case 6**: Check config hợp lệ → `/validate`

## ⏱️ Performance

- Response time: < 100ms
- Rate limit: Không giới hạn (có thể thêm)
- Timeout: Default Laravel timeout

## 🔒 Security Checklist

- [x] Authentication required
- [x] Input validation
- [x] Error handling
- [x] Logging enabled
- [ ] Rate limiting (optional)
- [ ] CORS configured (if needed)

---

**Quick Links:**
- [Full API Docs](FACEBOOK_JOIN_GROUP_CONFIG_API.md)
- [Testing Guide](FACEBOOK_JOIN_GROUP_API_TESTING.md)
- [Kotlin Guide](FACEBOOK_JOIN_GROUP_KOTLIN_INTEGRATION.md)
- [README](FACEBOOK_JOIN_GROUP_README.md)






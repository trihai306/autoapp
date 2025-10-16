# Facebook Join Group API - Examples & Use Cases

Các ví dụ thực tế sử dụng Facebook Join Group API.

## 📋 Table of Contents

1. [Use Case 1: Join nhiều nhóm marketing](#use-case-1-join-nhiều-nhóm-marketing)
2. [Use Case 2: Tìm và join nhóm theo niche](#use-case-2-tìm-và-join-nhóm-theo-niche)
3. [Use Case 3: Join nhanh cho testing](#use-case-3-join-nhanh-cho-testing)
4. [Use Case 4: Join nhóm theo schedule](#use-case-4-join-nhóm-theo-schedule)
5. [Use Case 5: Bulk join với validation](#use-case-5-bulk-join-với-validation)

---

## Use Case 1: Join nhiều nhóm marketing

**Scenario**: Bạn có 20 links nhóm Facebook về marketing và muốn join tất cả.

### Step 1: Prepare Data

```json
{
  "groupLinks": [
    "https://facebook.com/groups/digitalmarketing101",
    "https://facebook.com/groups/socialmediaexperts",
    "https://facebook.com/groups/contentcreators",
    "https://facebook.com/groups/facebookadsmastery",
    "https://facebook.com/groups/marketingstrategies",
    // ... 15 links nữa
  ]
}
```

### Step 2: Get Config từ API

**Request:**
```bash
curl -X POST "http://localhost:8000/api/app/facebook/join-group/config/join-by-links" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "groupLinks": [
      "https://facebook.com/groups/digitalmarketing101",
      "https://facebook.com/groups/socialmediaexperts",
      "https://facebook.com/groups/contentcreators"
    ],
    "maxGroups": 20,
    "maxDurationMinutes": 40
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "groupLinks": [...],
    "maxGroups": 20,
    "maxDurationMinutes": 40,
    "delayBetweenJoinsMs": 3000,
    "skipJoinedGroups": true,
    "joinPrivateGroups": true
  }
}
```

### Step 3: Validate Config

```bash
curl -X POST "http://localhost:8000/api/app/facebook/join-group/config/validate" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "config": {
      "groupLinks": [...],
      "maxGroups": 20,
      "maxDurationMinutes": 40,
      "delayBetweenJoinsMs": 3000
    }
  }'
```

### Step 4: Execute trong Android

```kotlin
suspend fun joinMarketingGroups() {
    val groupLinks = listOf(
        "https://facebook.com/groups/digitalmarketing101",
        "https://facebook.com/groups/socialmediaexperts",
        // ... more
    )
    
    // Get config
    val config = repository.getJoinByLinksConfig(
        groupLinks = groupLinks,
        maxGroups = 20,
        maxDurationMinutes = 40
    ).getOrNull() ?: return
    
    // Validate
    val isValid = repository.validateConfig(config).getOrNull() ?: false
    if (!isValid) {
        Log.e("App", "Config không hợp lệ")
        return
    }
    
    // Execute
    val workflow = FacebookJoinGroupWorkflow(accessibilityService)
    val result = workflow.executeJoinGroupWorkflow(config.toWorkflowConfig())
    
    if (result) {
        Log.i("App", "✅ Đã join thành công các nhóm marketing")
    }
}
```

**Expected Result:**
- Joined: 15-20 nhóm
- Duration: ~30-40 phút
- Skipped: Những nhóm đã join

---

## Use Case 2: Tìm và join nhóm theo niche

**Scenario**: Tìm kiếm và join các nhóm về React Development.

### Step 1: Prepare Search Keywords

```json
{
  "groupNames": [
    "React Developers",
    "ReactJS Vietnam",
    "React Native Community",
    "Frontend Developers",
    "JavaScript Vietnam"
  ]
}
```

### Step 2: Get Config

```bash
curl -X POST "http://localhost:8000/api/app/facebook/join-group/config/join-by-search" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "groupNames": [
      "React Developers",
      "ReactJS Vietnam",
      "React Native Community"
    ],
    "maxGroups": 10,
    "maxDurationMinutes": 25
  }'
```

### Step 3: Execute trong Android

```kotlin
suspend fun joinReactGroups() {
    val groupNames = listOf(
        "React Developers",
        "ReactJS Vietnam",
        "React Native Community"
    )
    
    val config = repository.getJoinBySearchConfig(
        groupNames = groupNames,
        maxGroups = 10,
        maxDurationMinutes = 25
    ).getOrNull() ?: return
    
    val workflow = FacebookJoinGroupWorkflow(accessibilityService)
    workflow.executeJoinGroupWorkflow(config.toWorkflowConfig())
}
```

**Expected Result:**
- Tìm được: 8-10 nhóm
- Join: 8-10 nhóm
- Duration: ~20-25 phút

---

## Use Case 3: Join nhanh cho testing

**Scenario**: Developer muốn test nhanh workflow với 3 nhóm.

### Fast Join Config

```bash
curl -X POST "http://localhost:8000/api/app/facebook/join-group/config/fast-join" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "groupLinks": [
      "https://facebook.com/groups/testgroup1",
      "https://facebook.com/groups/testgroup2",
      "https://facebook.com/groups/testgroup3"
    ],
    "maxGroups": 3
  }'
```

**Response (Fast Join có delays ngắn hơn):**
```json
{
  "data": {
    "groupLinks": [...],
    "maxGroups": 3,
    "maxDurationMinutes": 10,
    "delayBetweenJoinsMs": 1000,    // Nhanh hơn (vs 3000)
    "searchDelayMs": 1000,           // Nhanh hơn (vs 1500)
    "pageLoadDelayMs": 2000          // Nhanh hơn (vs 3000)
  }
}
```

**Android Code:**
```kotlin
// Quick test
suspend fun quickTest() {
    val testLinks = listOf(
        "https://facebook.com/groups/testgroup1",
        "https://facebook.com/groups/testgroup2"
    )
    
    val config = repository.getFastJoinConfig(
        groupLinks = testLinks,
        maxGroups = 3
    ).getOrNull() ?: return
    
    val workflow = FacebookJoinGroupWorkflow(accessibilityService)
    workflow.executeJoinGroupWorkflow(config.toWorkflowConfig())
}
```

**Expected Result:**
- Join: 3 nhóm
- Duration: ~5-8 phút
- Fast execution

---

## Use Case 4: Join nhóm theo schedule

**Scenario**: Join từng nhóm một theo schedule (mỗi giờ 1 nhóm).

### Custom Config với Delays dài

```bash
curl -X POST "http://localhost:8000/api/app/facebook/join-group/config/custom" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "groupLinks": [
      "https://facebook.com/groups/group1",
      "https://facebook.com/groups/group2"
    ],
    "maxGroups": 5,
    "maxDurationMinutes": 300,
    "delayBetweenJoinsMs": 3600000,
    "skipJoinedGroups": true
  }'
```

**Android với Scheduling:**
```kotlin
class ScheduledJoinWorkflow(
    private val repository: FacebookJoinGroupRepository,
    private val workflowManager: FacebookWorkflowManager
) {
    
    suspend fun executeScheduledJoin(groupLinks: List<String>) {
        // Get custom config với delay dài
        val apiService = // ... retrofit
        val response = apiService.createCustomConfig(
            FacebookJoinGroupConfig(
                groupLinks = groupLinks,
                maxGroups = groupLinks.size,
                maxDurationMinutes = 300, // 5 giờ
                delayBetweenJoinsMs = 3600000 // 1 giờ
            )
        )
        
        val config = response.body()?.data ?: return
        
        // Execute
        val workflow = FacebookJoinGroupWorkflow(accessibilityService)
        workflow.executeJoinGroupWorkflow(config.toWorkflowConfig())
    }
}
```

**Expected Result:**
- Join: 1 nhóm/giờ
- Duration: 5 giờ cho 5 nhóm
- Natural behavior (không spam)

---

## Use Case 5: Bulk join với validation

**Scenario**: Join 50 nhóm với validation kỹ càng.

### Step 1: Split into Batches

```kotlin
suspend fun bulkJoinWithValidation(allLinks: List<String>) {
    val batchSize = 10
    val batches = allLinks.chunked(batchSize)
    
    for ((index, batch) in batches.withIndex()) {
        Log.i("Bulk", "Processing batch ${index + 1}/${batches.size}")
        
        // Get config cho batch
        val config = repository.getJoinByLinksConfig(
            groupLinks = batch,
            maxGroups = batchSize,
            maxDurationMinutes = 20
        ).getOrNull() ?: continue
        
        // Validate config
        val isValid = repository.validateConfig(config).getOrNull() ?: false
        if (!isValid) {
            Log.e("Bulk", "Batch $index invalid, skipping")
            continue
        }
        
        // Execute batch
        val workflow = FacebookJoinGroupWorkflow(accessibilityService)
        val result = workflow.executeJoinGroupWorkflow(config.toWorkflowConfig())
        
        if (result) {
            Log.i("Bulk", "✅ Batch $index completed")
        } else {
            Log.e("Bulk", "❌ Batch $index failed")
        }
        
        // Delay giữa các batches
        delay(60000) // 1 phút
    }
}
```

### Step 2: Monitor Progress

```kotlin
data class BulkJoinProgress(
    val totalBatches: Int,
    val completedBatches: Int,
    val successfulJoins: Int,
    val failedJoins: Int
)

suspend fun bulkJoinWithProgress(
    allLinks: List<String>,
    onProgress: (BulkJoinProgress) -> Unit
) {
    val batchSize = 10
    val batches = allLinks.chunked(batchSize)
    
    var completedBatches = 0
    var successfulJoins = 0
    var failedJoins = 0
    
    for (batch in batches) {
        val config = repository.getJoinByLinksConfig(
            groupLinks = batch,
            maxGroups = batchSize
        ).getOrNull() ?: continue
        
        val workflow = FacebookJoinGroupWorkflow(accessibilityService)
        val result = workflow.executeJoinGroupWorkflow(config.toWorkflowConfig())
        
        completedBatches++
        if (result) successfulJoins += batch.size else failedJoins += batch.size
        
        // Report progress
        onProgress(BulkJoinProgress(
            totalBatches = batches.size,
            completedBatches = completedBatches,
            successfulJoins = successfulJoins,
            failedJoins = failedJoins
        ))
    }
}
```

**Usage:**
```kotlin
CoroutineScope(Dispatchers.Main).launch {
    bulkJoinWithProgress(allGroupLinks) { progress ->
        val percentage = (progress.completedBatches * 100) / progress.totalBatches
        Log.i("Progress", "Completed: $percentage%")
        Log.i("Progress", "Success: ${progress.successfulJoins}")
        Log.i("Progress", "Failed: ${progress.failedJoins}")
    }
}
```

---

## 🎯 Advanced Examples

### Example 6: Retry Logic

```kotlin
suspend fun joinWithRetry(
    groupLinks: List<String>,
    maxRetries: Int = 3
): Boolean {
    repeat(maxRetries) { attempt ->
        try {
            val config = repository.getJoinByLinksConfig(
                groupLinks = groupLinks,
                maxGroups = groupLinks.size
            ).getOrNull() ?: return@repeat
            
            val workflow = FacebookJoinGroupWorkflow(accessibilityService)
            val result = workflow.executeJoinGroupWorkflow(config.toWorkflowConfig())
            
            if (result) {
                Log.i("Retry", "Success on attempt ${attempt + 1}")
                return true
            }
            
            Log.w("Retry", "Failed attempt ${attempt + 1}, retrying...")
            delay(5000) // Wait before retry
            
        } catch (e: Exception) {
            Log.e("Retry", "Error on attempt ${attempt + 1}", e)
        }
    }
    
    return false
}
```

### Example 7: Conditional Join

```kotlin
suspend fun conditionalJoin(groupLinks: List<String>) {
    // Get config
    val config = repository.getJoinByLinksConfig(
        groupLinks = groupLinks,
        maxGroups = groupLinks.size
    ).getOrNull() ?: return
    
    // Check user balance/credits trước khi join
    val hasCredits = checkUserCredits()
    if (!hasCredits) {
        Log.e("Join", "Insufficient credits")
        return
    }
    
    // Check device battery
    val batteryLevel = getBatteryLevel()
    if (batteryLevel < 20) {
        Log.e("Join", "Battery too low")
        return
    }
    
    // Check network
    if (!isNetworkAvailable()) {
        Log.e("Join", "No network connection")
        return
    }
    
    // All checks passed, execute
    val workflow = FacebookJoinGroupWorkflow(accessibilityService)
    workflow.executeJoinGroupWorkflow(config.toWorkflowConfig())
}
```

### Example 8: Join with Logging & Analytics

```kotlin
suspend fun joinWithAnalytics(groupLinks: List<String>) {
    val startTime = System.currentTimeMillis()
    
    // Get config
    val config = repository.getJoinByLinksConfig(
        groupLinks = groupLinks,
        maxGroups = groupLinks.size
    ).getOrNull() ?: return
    
    // Log start
    analytics.logEvent("workflow_started", mapOf(
        "type" to "facebook_join_group",
        "group_count" to groupLinks.size
    ))
    
    // Execute
    val workflow = FacebookJoinGroupWorkflow(accessibilityService)
    val result = workflow.executeJoinGroupWorkflow(config.toWorkflowConfig())
    
    val duration = System.currentTimeMillis() - startTime
    
    // Log completion
    analytics.logEvent("workflow_completed", mapOf(
        "type" to "facebook_join_group",
        "success" to result,
        "duration_ms" to duration,
        "group_count" to groupLinks.size
    ))
    
    // Send to server
    apiService.sendWorkflowLog(WorkflowLog(
        type = "facebook_join_group",
        success = result,
        durationMs = duration,
        groupCount = groupLinks.size
    ))
}
```

---

## 🔧 Best Practices

### 1. Always Validate Config
```kotlin
val config = getConfig()
val isValid = repository.validateConfig(config).getOrNull() ?: false
if (!isValid) return

// Proceed with workflow
```

### 2. Handle Errors Gracefully
```kotlin
try {
    val result = workflow.execute(config)
    if (result) {
        showSuccess()
    } else {
        showError("Workflow failed")
    }
} catch (e: Exception) {
    Log.e("Error", "Unexpected error", e)
    showError(e.message)
}
```

### 3. Respect Rate Limits
```kotlin
// Don't use delays < 500ms
val config = config.copy(
    delayBetweenJoinsMs = max(config.delayBetweenJoinsMs, 500)
)
```

### 4. Monitor Progress
```kotlin
// Send progress updates
WebSocketManager.sendProgress(
    current = processedCount,
    total = totalCount
)
```

### 5. Clean Up Resources
```kotlin
try {
    workflow.execute(config)
} finally {
    // Clean up
    workflow.cleanup()
}
```

---

## 📊 Performance Tips

1. **Use Fast Join for small batches** (< 5 groups)
2. **Split large batches** into smaller chunks (10-15 groups)
3. **Add delays between batches** to avoid detection
4. **Validate before execute** to catch errors early
5. **Monitor logs** for debugging

---

## 🎉 Conclusion

Các examples trên cover hầu hết use cases thực tế. Kết hợp các patterns này để build workflow phù hợp với nhu cầu của bạn.

**Key Takeaways:**
- Always validate config
- Handle errors properly
- Respect rate limits
- Monitor progress
- Log everything

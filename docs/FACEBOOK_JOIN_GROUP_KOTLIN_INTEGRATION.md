# Kotlin Integration Guide - Facebook Join Group Workflow

Hướng dẫn tích hợp API config vào Android App (Kotlin).

## 📋 Setup

### 1. Thêm Dependencies (build.gradle)

```gradle
dependencies {
    // Retrofit cho API calls
    implementation 'com.squareup.retrofit2:retrofit:2.9.0'
    implementation 'com.squareup.retrofit2:converter-gson:2.9.0'
    
    // Coroutines
    implementation 'org.jetbrains.kotlinx:kotlinx-coroutines-android:1.7.3'
    
    // OkHttp logging
    implementation 'com.squareup.okhttp3:logging-interceptor:4.11.0'
}
```

### 2. Tạo Data Models

```kotlin
// File: models/FacebookJoinGroupConfig.kt
package com.tencongty.autobottiktok.models.facebook

import com.google.gson.annotations.SerializedName

/**
 * Config cho Facebook Join Group Workflow
 * Map với JoinGroupConfig trong Kotlin workflow
 */
data class FacebookJoinGroupConfig(
    @SerializedName("groupLinks")
    val groupLinks: List<String> = emptyList(),
    
    @SerializedName("groupNames")
    val groupNames: List<String> = emptyList(),
    
    @SerializedName("maxGroups")
    val maxGroups: Int = 10,
    
    @SerializedName("maxDurationMinutes")
    val maxDurationMinutes: Int = 30,
    
    @SerializedName("delayBetweenJoinsMs")
    val delayBetweenJoinsMs: Long = 3000L,
    
    @SerializedName("searchDelayMs")
    val searchDelayMs: Long = 1500L,
    
    @SerializedName("pageLoadDelayMs")
    val pageLoadDelayMs: Long = 3000L,
    
    @SerializedName("skipJoinedGroups")
    val skipJoinedGroups: Boolean = true,
    
    @SerializedName("joinPrivateGroups")
    val joinPrivateGroups: Boolean = true,
    
    @SerializedName("scrollToFindJoinButton")
    val scrollToFindJoinButton: Boolean = true,
    
    @SerializedName("maxScrollAttempts")
    val maxScrollAttempts: Int = 5
) {
    /**
     * Convert sang JoinGroupConfig của workflow
     */
    fun toWorkflowConfig(): FacebookJoinGroupWorkflow.JoinGroupConfig {
        return FacebookJoinGroupWorkflow.JoinGroupConfig(
            groupLinks = this.groupLinks,
            groupNames = this.groupNames,
            maxGroups = this.maxGroups,
            maxDurationMinutes = this.maxDurationMinutes,
            delayBetweenJoinsMs = this.delayBetweenJoinsMs,
            searchDelayMs = this.searchDelayMs,
            pageLoadDelayMs = this.pageLoadDelayMs,
            skipJoinedGroups = this.skipJoinedGroups,
            joinPrivateGroups = this.joinPrivateGroups,
            scrollToFindJoinButton = this.scrollToFindJoinButton,
            maxScrollAttempts = this.maxScrollAttempts
        )
    }
}

/**
 * Response wrapper cho API
 */
data class ConfigResponse(
    @SerializedName("success")
    val success: Boolean,
    
    @SerializedName("data")
    val data: FacebookJoinGroupConfig?,
    
    @SerializedName("message")
    val message: String
)

/**
 * Validation response
 */
data class ConfigValidationResponse(
    @SerializedName("success")
    val success: Boolean,
    
    @SerializedName("valid")
    val valid: Boolean,
    
    @SerializedName("errors")
    val errors: List<String>,
    
    @SerializedName("config")
    val config: FacebookJoinGroupConfig?,
    
    @SerializedName("message")
    val message: String
)

/**
 * Request models
 */
data class JoinByLinksRequest(
    @SerializedName("groupLinks")
    val groupLinks: List<String>,
    
    @SerializedName("maxGroups")
    val maxGroups: Int? = null,
    
    @SerializedName("maxDurationMinutes")
    val maxDurationMinutes: Int? = null
)

data class JoinBySearchRequest(
    @SerializedName("groupNames")
    val groupNames: List<String>,
    
    @SerializedName("maxGroups")
    val maxGroups: Int? = null,
    
    @SerializedName("maxDurationMinutes")
    val maxDurationMinutes: Int? = null
)

data class FastJoinRequest(
    @SerializedName("groupLinks")
    val groupLinks: List<String>,
    
    @SerializedName("maxGroups")
    val maxGroups: Int? = null
)

data class SingleJoinRequest(
    @SerializedName("groupLinkOrName")
    val groupLinkOrName: String,
    
    @SerializedName("isLink")
    val isLink: Boolean = true
)

data class ValidateConfigRequest(
    @SerializedName("config")
    val config: FacebookJoinGroupConfig
)
```

### 3. Tạo API Service

```kotlin
// File: api/FacebookJoinGroupApiService.kt
package com.tencongty.autobottiktok.api

import com.tencongty.autobottiktok.models.facebook.*
import retrofit2.Response
import retrofit2.http.*

interface FacebookJoinGroupApiService {
    
    /**
     * Lấy default config
     */
    @GET("app/facebook/join-group/config/default")
    suspend fun getDefaultConfig(): Response<ConfigResponse>
    
    /**
     * Lấy config join by links
     */
    @POST("app/facebook/join-group/config/join-by-links")
    suspend fun getJoinByLinksConfig(
        @Body request: JoinByLinksRequest
    ): Response<ConfigResponse>
    
    /**
     * Lấy config join by search
     */
    @POST("app/facebook/join-group/config/join-by-search")
    suspend fun getJoinBySearchConfig(
        @Body request: JoinBySearchRequest
    ): Response<ConfigResponse>
    
    /**
     * Lấy config fast join
     */
    @POST("app/facebook/join-group/config/fast-join")
    suspend fun getFastJoinConfig(
        @Body request: FastJoinRequest
    ): Response<ConfigResponse>
    
    /**
     * Lấy config single join
     */
    @POST("app/facebook/join-group/config/single-join")
    suspend fun getSingleJoinConfig(
        @Body request: SingleJoinRequest
    ): Response<ConfigResponse>
    
    /**
     * Tạo custom config
     */
    @POST("app/facebook/join-group/config/custom")
    suspend fun createCustomConfig(
        @Body config: FacebookJoinGroupConfig
    ): Response<ConfigResponse>
    
    /**
     * Validate config
     */
    @POST("app/facebook/join-group/config/validate")
    suspend fun validateConfig(
        @Body request: ValidateConfigRequest
    ): Response<ConfigValidationResponse>
}
```

### 4. Tạo Repository

```kotlin
// File: repository/FacebookJoinGroupRepository.kt
package com.tencongty.autobottiktok.repository

import android.util.Log
import com.tencongty.autobottiktok.api.FacebookJoinGroupApiService
import com.tencongty.autobottiktok.models.facebook.*

class FacebookJoinGroupRepository(
    private val apiService: FacebookJoinGroupApiService
) {
    companion object {
        private const val TAG = "FacebookJoinGroupRepo"
    }
    
    /**
     * Lấy default config
     */
    suspend fun getDefaultConfig(): Result<FacebookJoinGroupConfig> {
        return try {
            val response = apiService.getDefaultConfig()
            if (response.isSuccessful && response.body()?.success == true) {
                val config = response.body()?.data
                if (config != null) {
                    Result.success(config)
                } else {
                    Result.failure(Exception("Config is null"))
                }
            } else {
                Result.failure(Exception("API error: ${response.message()}"))
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error getting default config", e)
            Result.failure(e)
        }
    }
    
    /**
     * Lấy config join by links
     */
    suspend fun getJoinByLinksConfig(
        groupLinks: List<String>,
        maxGroups: Int? = null,
        maxDurationMinutes: Int? = null
    ): Result<FacebookJoinGroupConfig> {
        return try {
            val request = JoinByLinksRequest(
                groupLinks = groupLinks,
                maxGroups = maxGroups,
                maxDurationMinutes = maxDurationMinutes
            )
            
            val response = apiService.getJoinByLinksConfig(request)
            if (response.isSuccessful && response.body()?.success == true) {
                val config = response.body()?.data
                if (config != null) {
                    Result.success(config)
                } else {
                    Result.failure(Exception("Config is null"))
                }
            } else {
                Result.failure(Exception("API error: ${response.message()}"))
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error getting join by links config", e)
            Result.failure(e)
        }
    }
    
    /**
     * Lấy config join by search
     */
    suspend fun getJoinBySearchConfig(
        groupNames: List<String>,
        maxGroups: Int? = null,
        maxDurationMinutes: Int? = null
    ): Result<FacebookJoinGroupConfig> {
        return try {
            val request = JoinBySearchRequest(
                groupNames = groupNames,
                maxGroups = maxGroups,
                maxDurationMinutes = maxDurationMinutes
            )
            
            val response = apiService.getJoinBySearchConfig(request)
            if (response.isSuccessful && response.body()?.success == true) {
                val config = response.body()?.data
                if (config != null) {
                    Result.success(config)
                } else {
                    Result.failure(Exception("Config is null"))
                }
            } else {
                Result.failure(Exception("API error: ${response.message()}"))
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error getting join by search config", e)
            Result.failure(e)
        }
    }
    
    /**
     * Lấy config fast join
     */
    suspend fun getFastJoinConfig(
        groupLinks: List<String>,
        maxGroups: Int? = null
    ): Result<FacebookJoinGroupConfig> {
        return try {
            val request = FastJoinRequest(
                groupLinks = groupLinks,
                maxGroups = maxGroups
            )
            
            val response = apiService.getFastJoinConfig(request)
            if (response.isSuccessful && response.body()?.success == true) {
                val config = response.body()?.data
                if (config != null) {
                    Result.success(config)
                } else {
                    Result.failure(Exception("Config is null"))
                }
            } else {
                Result.failure(Exception("API error: ${response.message()}"))
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error getting fast join config", e)
            Result.failure(e)
        }
    }
    
    /**
     * Validate config
     */
    suspend fun validateConfig(config: FacebookJoinGroupConfig): Result<Boolean> {
        return try {
            val request = ValidateConfigRequest(config)
            val response = apiService.validateConfig(request)
            
            if (response.isSuccessful && response.body()?.success == true) {
                Result.success(response.body()?.valid ?: false)
            } else {
                Result.failure(Exception("Validation failed"))
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error validating config", e)
            Result.failure(e)
        }
    }
}
```

### 5. Sử dụng trong Workflow Manager

```kotlin
// File: manager/FacebookWorkflowManager.kt
package com.tencongty.autobottiktok.manager

import android.accessibilityservice.AccessibilityService
import android.util.Log
import com.tencongty.autobottiktok.repository.FacebookJoinGroupRepository
import com.tencongty.autobottiktok.workflows.facebook.FacebookJoinGroupWorkflow
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

class FacebookWorkflowManager(
    private val accessibilityService: AccessibilityService,
    private val repository: FacebookJoinGroupRepository
) {
    companion object {
        private const val TAG = "FacebookWorkflowManager"
    }
    
    /**
     * Thực hiện workflow join by links
     */
    suspend fun executeJoinByLinks(
        groupLinks: List<String>,
        maxGroups: Int = 10,
        maxDurationMinutes: Int = 20
    ): Boolean = withContext(Dispatchers.IO) {
        try {
            Log.i(TAG, "🚀 Bắt đầu join by links workflow")
            Log.i(TAG, "📊 Số links: ${groupLinks.size}")
            
            // 1. Lấy config từ API
            val configResult = repository.getJoinByLinksConfig(
                groupLinks = groupLinks,
                maxGroups = maxGroups,
                maxDurationMinutes = maxDurationMinutes
            )
            
            if (configResult.isFailure) {
                Log.e(TAG, "❌ Không lấy được config từ API")
                return@withContext false
            }
            
            val apiConfig = configResult.getOrNull() ?: return@withContext false
            Log.i(TAG, "✅ Đã lấy config từ API")
            
            // 2. Validate config
            val validationResult = repository.validateConfig(apiConfig)
            if (validationResult.isFailure || validationResult.getOrNull() == false) {
                Log.e(TAG, "❌ Config không hợp lệ")
                return@withContext false
            }
            Log.i(TAG, "✅ Config hợp lệ")
            
            // 3. Convert sang workflow config
            val workflowConfig = apiConfig.toWorkflowConfig()
            
            // 4. Thực hiện workflow
            val workflow = FacebookJoinGroupWorkflow(accessibilityService)
            val result = workflow.executeJoinGroupWorkflow(workflowConfig)
            
            if (result) {
                Log.i(TAG, "✅ Workflow hoàn thành thành công")
            } else {
                Log.e(TAG, "❌ Workflow thất bại")
            }
            
            result
            
        } catch (e: Exception) {
            Log.e(TAG, "❌ Lỗi trong workflow", e)
            false
        }
    }
    
    /**
     * Thực hiện workflow join by search
     */
    suspend fun executeJoinBySearch(
        groupNames: List<String>,
        maxGroups: Int = 10,
        maxDurationMinutes: Int = 25
    ): Boolean = withContext(Dispatchers.IO) {
        try {
            Log.i(TAG, "🚀 Bắt đầu join by search workflow")
            Log.i(TAG, "📊 Số group names: ${groupNames.size}")
            
            val configResult = repository.getJoinBySearchConfig(
                groupNames = groupNames,
                maxGroups = maxGroups,
                maxDurationMinutes = maxDurationMinutes
            )
            
            if (configResult.isFailure) {
                Log.e(TAG, "❌ Không lấy được config từ API")
                return@withContext false
            }
            
            val apiConfig = configResult.getOrNull() ?: return@withContext false
            val workflowConfig = apiConfig.toWorkflowConfig()
            
            val workflow = FacebookJoinGroupWorkflow(accessibilityService)
            workflow.executeJoinGroupWorkflow(workflowConfig)
            
        } catch (e: Exception) {
            Log.e(TAG, "❌ Lỗi trong workflow", e)
            false
        }
    }
    
    /**
     * Thực hiện workflow fast join
     */
    suspend fun executeFastJoin(
        groupLinks: List<String>,
        maxGroups: Int = 5
    ): Boolean = withContext(Dispatchers.IO) {
        try {
            Log.i(TAG, "⚡ Bắt đầu fast join workflow")
            
            val configResult = repository.getFastJoinConfig(
                groupLinks = groupLinks,
                maxGroups = maxGroups
            )
            
            if (configResult.isFailure) {
                Log.e(TAG, "❌ Không lấy được config từ API")
                return@withContext false
            }
            
            val apiConfig = configResult.getOrNull() ?: return@withContext false
            val workflowConfig = apiConfig.toWorkflowConfig()
            
            val workflow = FacebookJoinGroupWorkflow(accessibilityService)
            workflow.executeJoinGroupWorkflow(workflowConfig)
            
        } catch (e: Exception) {
            Log.e(TAG, "❌ Lỗi trong workflow", e)
            false
        }
    }
    
    /**
     * Thực hiện với custom config
     */
    suspend fun executeWithCustomConfig(
        customConfig: FacebookJoinGroupConfig
    ): Boolean = withContext(Dispatchers.IO) {
        try {
            Log.i(TAG, "⚙️ Bắt đầu workflow với custom config")
            
            // Validate config trước
            val validationResult = repository.validateConfig(customConfig)
            if (validationResult.isFailure || validationResult.getOrNull() == false) {
                Log.e(TAG, "❌ Custom config không hợp lệ")
                return@withContext false
            }
            
            val workflowConfig = customConfig.toWorkflowConfig()
            val workflow = FacebookJoinGroupWorkflow(accessibilityService)
            workflow.executeJoinGroupWorkflow(workflowConfig)
            
        } catch (e: Exception) {
            Log.e(TAG, "❌ Lỗi trong workflow", e)
            false
        }
    }
}
```

### 6. Sử dụng trong Activity/Service

```kotlin
// File: YourActivity.kt hoặc YourAccessibilityService.kt

import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

class YourAccessibilityService : AccessibilityService() {
    
    private lateinit var workflowManager: FacebookWorkflowManager
    
    override fun onCreate() {
        super.onCreate()
        
        // Initialize manager
        val apiService = // ... tạo Retrofit instance
        val repository = FacebookJoinGroupRepository(apiService)
        workflowManager = FacebookWorkflowManager(this, repository)
    }
    
    /**
     * Ví dụ 1: Join by links
     */
    fun startJoinByLinks() {
        CoroutineScope(Dispatchers.Main).launch {
            val groupLinks = listOf(
                "https://facebook.com/groups/123456789",
                "https://facebook.com/groups/987654321"
            )
            
            val result = workflowManager.executeJoinByLinks(
                groupLinks = groupLinks,
                maxGroups = 10,
                maxDurationMinutes = 20
            )
            
            if (result) {
                Log.i("App", "✅ Join workflow thành công")
            } else {
                Log.e("App", "❌ Join workflow thất bại")
            }
        }
    }
    
    /**
     * Ví dụ 2: Join by search
     */
    fun startJoinBySearch() {
        CoroutineScope(Dispatchers.Main).launch {
            val groupNames = listOf(
                "React Developers Vietnam",
                "Laravel Vietnam Community"
            )
            
            val result = workflowManager.executeJoinBySearch(
                groupNames = groupNames,
                maxGroups = 5
            )
            
            if (result) {
                Log.i("App", "✅ Search & join workflow thành công")
            }
        }
    }
    
    /**
     * Ví dụ 3: Fast join
     */
    fun startFastJoin() {
        CoroutineScope(Dispatchers.Main).launch {
            val groupLinks = listOf(
                "https://facebook.com/groups/123456789"
            )
            
            workflowManager.executeFastJoin(
                groupLinks = groupLinks,
                maxGroups = 3
            )
        }
    }
}
```

## 🔧 Error Handling

### Xử lý lỗi network

```kotlin
suspend fun executeWithRetry(
    groupLinks: List<String>,
    maxRetries: Int = 3
): Boolean {
    repeat(maxRetries) { attempt ->
        try {
            val result = workflowManager.executeJoinByLinks(groupLinks)
            if (result) return true
            
            Log.w(TAG, "Attempt ${attempt + 1} failed, retrying...")
            delay(2000L) // Wait before retry
            
        } catch (e: Exception) {
            Log.e(TAG, "Error on attempt ${attempt + 1}", e)
            if (attempt == maxRetries - 1) {
                throw e
            }
        }
    }
    return false
}
```

### Xử lý validation errors

```kotlin
suspend fun executeWithValidation(
    config: FacebookJoinGroupConfig
): Boolean {
    val validationResult = repository.validateConfig(config)
    
    if (validationResult.isFailure) {
        Log.e(TAG, "Validation request failed")
        return false
    }
    
    val isValid = validationResult.getOrNull() ?: false
    if (!isValid) {
        Log.e(TAG, "Config is not valid")
        // Show error to user
        return false
    }
    
    // Proceed with workflow
    return workflowManager.executeWithCustomConfig(config)
}
```

## 📊 Logging & Analytics

### Gửi logs về server

```kotlin
suspend fun sendWorkflowResult(
    success: Boolean,
    groupsJoined: Int,
    duration: Long
) {
    try {
        apiService.sendWorkflowLog(
            WorkflowLogRequest(
                type = "facebook_join_group",
                success = success,
                groupsJoined = groupsJoined,
                durationMs = duration,
                timestamp = System.currentTimeMillis()
            )
        )
    } catch (e: Exception) {
        Log.e(TAG, "Failed to send log", e)
    }
}
```

## 🎯 Best Practices

1. **Luôn validate config trước khi chạy workflow**
2. **Sử dụng CoroutineScope phù hợp (IO cho network, Main cho UI)**
3. **Handle errors gracefully với try-catch**
4. **Log đầy đủ để debug**
5. **Retry logic cho network requests**
6. **Respect rate limits (delay giữa các requests)**

## 🔒 Security Notes

- Lưu access token an toàn (EncryptedSharedPreferences)
- Không hardcode API URLs
- Validate input từ user trước khi gửi lên server
- Handle token expiration và refresh




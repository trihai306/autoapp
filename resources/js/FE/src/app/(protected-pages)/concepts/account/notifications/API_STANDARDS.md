# API Standards cho Notifications

## Mô hình chuẩn của dự án

### 1. Service Layer (`/services/notification/NotificationService.js`)

```javascript
import ApiService from '@/services/ApiService'

export async function apiGetNotifications(params) {
    return ApiService.fetchDataWithAxios({
        url: '/api/notifications',
        method: 'get',
        params,
    })
}

export async function apiMarkNotificationAsRead(id) {
    return ApiService.fetchDataWithAxios({
        url: `/api/notifications/${id}/mark-read`,
        method: 'post',
    })
}
```

**Quy tắc:**
- Sử dụng `ApiService.fetchDataWithAxios()` thay vì gọi trực tiếp
- URL phải có prefix `/api/`
- Method phải rõ ràng (GET, POST, PUT, DELETE, PATCH)
- Params và data được truyền đúng cách

### 2. Server Actions (`/server/actions/notification/`)

```javascript
'use server'

import { apiGetNotifications } from '@/services/notification/NotificationService'
import { withAuthCheck } from '@/utils/withAuthCheck'

export default async function getNotifications(params = {}) {
    return withAuthCheck(async () => {
        try {
            const resp = await apiGetNotifications(params)
            return {
                success: true,
                data: resp.data || [],
                total: resp.total || 0,
                loadable: resp.next_page_url ? true : false,
            }
        } catch (error) {
            console.error("Error fetching notifications:", error)
            return {
                success: false,
                message: "An unexpected error occurred while fetching notifications.",
                data: [],
                total: 0,
                loadable: false,
            }
        }
    })
}
```

**Quy tắc:**
- Luôn sử dụng `withAuthCheck()` để xử lý authentication
- Response format chuẩn: `{ success, data, message, ... }`
- Error handling tập trung và nhất quán
- Luôn có fallback values cho data

### 3. Response Format Chuẩn

#### Success Response:
```javascript
{
    success: true,
    data: [...], // Array data
    total: 100,  // Total count
    loadable: true, // Can load more
    message: "Success message" // Optional
}
```

#### Error Response:
```javascript
{
    success: false,
    message: "Error message",
    data: [], // Empty array as fallback
    total: 0, // 0 as fallback
    loadable: false // false as fallback
}
```

### 4. Authentication & Error Handling

#### withAuthCheck Utility:
- Tự động xử lý 401 Unauthorized
- Redirect to `/force-logout` khi authentication fail
- Revalidate cache khi cần thiết

#### Error Handling:
- Console.error cho debugging
- User-friendly error messages
- Graceful fallbacks

### 5. API Endpoints Mapping

| Frontend Service | Backend Endpoint | Method | Description |
|------------------|------------------|---------|-------------|
| `apiGetNotifications` | `/api/notifications` | GET | Lấy danh sách thông báo |
| `apiMarkNotificationAsRead` | `/api/notifications/{id}/mark-read` | POST | Đánh dấu đã đọc |
| `apiMarkAllNotificationsAsRead` | `/api/notifications/mark-all-read` | POST | Đánh dấu tất cả đã đọc |
| `apiDeleteNotification` | `/api/notifications/{id}` | DELETE | Xóa thông báo |
| `apiDeleteMultipleNotifications` | `/api/notifications/bulk-delete` | POST | Xóa nhiều thông báo |

### 6. Component Usage

#### Trong Component:
```javascript
const handleAction = async () => {
    try {
        const result = await actionFunction(params)
        if (result.success) {
            // Handle success
            setData(result.data)
        } else {
            // Handle error
            console.error(result.message)
        }
    } catch (error) {
        // Handle unexpected error
        console.error('Unexpected error:', error)
    }
}
```

#### Trong Page:
```javascript
export default async function Page() {
    const resp = await getNotifications({ page: 1, per_page: 15 })
    
    return (
        <Provider 
            data={resp.success ? resp.data : []} 
            loadable={resp.success ? resp.loadable : false}
        >
            <Component />
        </Provider>
    )
}
```

### 7. Best Practices

1. **Consistent Error Handling**: Luôn kiểm tra `result.success`
2. **Fallback Values**: Luôn có giá trị mặc định cho data
3. **Authentication**: Sử dụng `withAuthCheck` cho tất cả server actions
4. **Logging**: Console.error cho tất cả errors
5. **User Feedback**: Hiển thị error messages cho user khi cần
6. **Type Safety**: Đảm bảo data structure nhất quán

### 8. Testing

#### Test Cases:
- ✅ Success response handling
- ✅ Error response handling
- ✅ Authentication failure
- ✅ Network error handling
- ✅ Data validation
- ✅ Fallback values

#### Example Test:
```javascript
describe('getNotifications', () => {
    it('should handle success response', async () => {
        const result = await getNotifications()
        expect(result.success).toBe(true)
        expect(Array.isArray(result.data)).toBe(true)
        expect(typeof result.loadable).toBe('boolean')
    })
    
    it('should handle error response', async () => {
        // Mock error case
        const result = await getNotifications()
        expect(result.success).toBe(false)
        expect(result.message).toBeDefined()
        expect(result.data).toEqual([])
    })
})
```

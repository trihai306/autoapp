# Proxy Management Frontend Documentation

## Tổng quan

Proxy Management Frontend là một trang quản lý proxy server được xây dựng với React, Ant Design và Next.js. Trang này cung cấp giao diện người dùng để quản lý các proxy server một cách trực quan và dễ dàng.

## Cấu trúc Files

### 1. Services Layer
```
resources/js/FE/src/services/proxy/ProxyService.js
```
- Chứa tất cả các API calls đến backend
- Sử dụng `ApiService` để xử lý authentication và error handling
- Các functions chính:
  - `apiGetProxies()` - Lấy danh sách proxy
  - `apiCreateProxy()` - Tạo proxy mới
  - `apiUpdateProxy()` - Cập nhật proxy
  - `apiDeleteProxy()` - Xóa proxy
  - `apiBulkDeleteProxies()` - Xóa nhiều proxy
  - `apiBulkUpdateProxyStatus()` - Cập nhật trạng thái hàng loạt
  - `apiTestProxyConnection()` - Test kết nối
  - `apiGetActiveProxies()` - Lấy active proxies
  - `apiGetProxyStats()` - Lấy thống kê
  - `apiImportProxies()` - Import proxies
  - `apiGetProxyFullUrl()` - Lấy URL đầy đủ

### 2. Server Actions Layer
```
resources/js/FE/src/server/actions/proxy/
├── getProxies.js
├── getProxy.js
├── createProxy.js
├── updateProxy.js
├── deleteProxy.js
├── deleteProxies.js
├── updateProxyStatus.js
├── testProxyConnection.js
├── getActiveProxies.js
├── getProxyStats.js
└── importProxies.js
```

Mỗi server action đều:
- Sử dụng `withAuthCheck()` để kiểm tra authentication
- Wrap logic trong try-catch để xử lý lỗi
- Trả về format response chuẩn: `{ success, data, message }`
- Sử dụng `handleServerActionError()` cho error handling

### 3. UI Components
```
resources/js/FE/src/app/concepts/proxy-management/page.jsx
```

## Authentication & Authorization

### 1. withAuthCheck Pattern
```javascript
export default async function getProxies(params = {}) {
    return withAuthCheck(async () => {
        try {
            const response = await apiGetProxies(params)
            return {
                success: true,
                data: response.data,
                pagination: response.pagination || null,
                total: response.total || 0,
            }
        } catch (error) {
            return handleServerActionError(error, 'Failed to fetch proxies')
        }
    })
}
```

**Cách hoạt động:**
- `withAuthCheck()` kiểm tra session và token
- Nếu 401 Unauthorized → redirect đến `/force-logout`
- Nếu lỗi khác → re-throw để component xử lý
- Nếu thành công → trả về kết quả

### 2. ApiService Authentication
```javascript
// Tự động thêm Bearer token vào headers
const headers = param.headers || {};
if (token) {
    headers['Authorization'] = `Bearer ${token}`;
}
```

### 3. Permission-based Access
```javascript
// Navigation config
permissions: ['proxies.view'], // Yêu cầu quyền proxies.view
authority: [ADMIN], // Chỉ admin mới truy cập được
```

## Features

### 1. CRUD Operations
- **Create**: Modal form với validation
- **Read**: Table với pagination, search, filter, sort
- **Update**: Inline edit hoặc modal form
- **Delete**: Single delete và bulk delete

### 2. Advanced Features
- **Search**: Tìm kiếm theo name, host, username, country, city, notes
- **Filter**: Lọc theo status, type, country
- **Sort**: Sắp xếp theo các cột
- **Bulk Operations**: Xóa và cập nhật trạng thái hàng loạt
- **Import**: Import proxies từ text format
- **Test Connection**: Test kết nối proxy real-time
- **Statistics**: Dashboard với thống kê

### 3. UI/UX Features
- **Responsive Design**: Hoạt động tốt trên mobile và desktop
- **Loading States**: Hiển thị loading khi đang tải dữ liệu
- **Error Handling**: Hiển thị error messages rõ ràng
- **Confirmation Dialogs**: Xác nhận trước khi xóa
- **Real-time Updates**: Tự động refresh sau khi thao tác

## API Integration

### 1. Request Format
```javascript
// GET /proxies với params
const params = {
    page: 1,
    per_page: 10,
    search: 'keyword',
    'filter[status]': 'active',
    'filter[type]': 'http',
    sort: '-created_at'
}
```

### 2. Response Format
```javascript
{
    success: true,
    data: [...], // Array of proxies
    pagination: {
        current_page: 1,
        per_page: 10,
        total: 100,
        last_page: 10
    },
    total: 100
}
```

### 3. Error Handling
```javascript
// Validation errors
if (error.response?.status === 422) {
    const validationErrors = error.response.data?.errors || {}
    const errorMessages = Object.values(validationErrors).flat()
    return {
        success: false,
        message: errorMessages.join(', '),
        errors: validationErrors
    }
}
```

## State Management

### 1. Local State
```javascript
const [proxies, setProxies] = useState([])
const [loading, setLoading] = useState(false)
const [stats, setStats] = useState({})
const [pagination, setPagination] = useState({...})
const [filters, setFilters] = useState({})
const [selectedRowKeys, setSelectedRowKeys] = useState([])
```

### 2. Form State
```javascript
const [form] = Form.useForm()
const [modalVisible, setModalVisible] = useState(false)
const [editingProxy, setEditingProxy] = useState(null)
```

## Data Flow

### 1. Load Data
```
Component Mount → loadProxies() → getProxies() → withAuthCheck() → apiGetProxies() → Backend API
```

### 2. Create/Update
```
Form Submit → handleSubmit() → createProxy()/updateProxy() → withAuthCheck() → apiCreateProxy()/apiUpdateProxy() → Backend API
```

### 3. Delete
```
Delete Button → handleDelete() → deleteProxy() → withAuthCheck() → apiDeleteProxy() → Backend API
```

## Error Handling Strategy

### 1. Network Errors
- Hiển thị message lỗi cho user
- Log error để debug
- Retry mechanism cho một số operations

### 2. Validation Errors
- Hiển thị validation errors trong form
- Highlight các field có lỗi
- Prevent submit nếu có lỗi

### 3. Authentication Errors
- Tự động redirect đến login page
- Clear local storage và session
- Show appropriate message

## Performance Optimizations

### 1. Pagination
- Load data theo trang
- Không load tất cả data cùng lúc
- Caching pagination state

### 2. Debounced Search
- Delay search request để tránh spam API
- Cancel previous request nếu có request mới

### 3. Optimistic Updates
- Update UI ngay lập tức
- Rollback nếu API call thất bại

## Security Considerations

### 1. Input Validation
- Validate tất cả user input
- Sanitize data trước khi gửi lên server
- Prevent XSS attacks

### 2. Authentication
- Kiểm tra token mỗi request
- Auto logout khi token expired
- Secure token storage

### 3. Authorization
- Check permissions trước khi thực hiện actions
- Hide UI elements dựa trên permissions
- Server-side validation

## Testing Strategy

### 1. Unit Tests
- Test individual functions
- Mock API calls
- Test error scenarios

### 2. Integration Tests
- Test API integration
- Test authentication flow
- Test error handling

### 3. E2E Tests
- Test user workflows
- Test UI interactions
- Test responsive design

## Deployment

### 1. Build Process
```bash
npm run build
```

### 2. Environment Variables
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_API_PREFIX=/api
```

### 3. Production Considerations
- Enable compression
- Optimize bundle size
- Enable caching
- Monitor performance

## Troubleshooting

### 1. Common Issues
- **401 Errors**: Check token và session
- **Network Errors**: Check API endpoint và connectivity
- **Validation Errors**: Check form data format

### 2. Debug Tools
- Browser DevTools
- Network tab để check API calls
- Console logs để debug

### 3. Logging
- Client-side error logging
- API call logging
- Performance monitoring

## Future Enhancements

### 1. Planned Features
- Real-time proxy status updates
- Advanced filtering options
- Export functionality
- Proxy rotation algorithms
- Performance metrics

### 2. Technical Improvements
- Implement React Query/SWR
- Add more unit tests
- Optimize bundle size
- Add PWA features

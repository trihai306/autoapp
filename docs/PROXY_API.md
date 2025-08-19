# Proxy API Documentation

## Tổng quan

API Proxy cho phép quản lý các proxy server được sử dụng cho các tài khoản TikTok. API này hỗ trợ đầy đủ các thao tác CRUD và các tính năng nâng cao như test connection, import hàng loạt, và thống kê.

## Authentication

Tất cả các API endpoints đều yêu cầu authentication thông qua Bearer token:

```
Authorization: Bearer {your-token}
```

## Base URL

```
https://your-domain.com/api
```

## Endpoints

### 1. Lấy danh sách Proxy

**GET** `/proxies`

Lấy danh sách tất cả proxy với phân trang và filtering.

**Query Parameters:**
- `search`: Tìm kiếm theo name, host, username, country, city, notes
- `filter[user_id]`: Lọc theo user ID
- `filter[type]`: Lọc theo loại proxy (http, https, socks4, socks5)
- `filter[status]`: Lọc theo trạng thái (active, inactive, error)
- `filter[country]`: Lọc theo quốc gia
- `sort`: Sắp xếp (prefix `-` để giảm dần)
- `page`: Số trang
- `per_page`: Số item mỗi trang

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "user_id": 1,
      "name": "US Proxy 1",
      "host": "192.168.1.100",
      "port": 8080,
      "username": "user123",
      "password": "pass123",
      "type": "http",
      "status": "active",
      "country": "United States",
      "city": "New York",
      "notes": "High speed proxy",
      "last_used_at": "2024-01-15T10:30:00Z",
      "last_tested_at": "2024-01-15T09:00:00Z",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-15T10:30:00Z",
      "user": {
        "id": 1,
        "name": "John Doe"
      }
    }
  ],
  "links": {...},
  "meta": {...}
}
```

### 2. Tạo Proxy mới

**POST** `/proxies`

Tạo proxy mới.

**Request Body:**
```json
{
  "user_id": 1,
  "name": "US Proxy 1",
  "host": "192.168.1.100",
  "port": 8080,
  "username": "user123",
  "password": "pass123",
  "type": "http",
  "status": "active",
  "country": "United States",
  "city": "New York",
  "notes": "High speed proxy"
}
```

**Response:** `201 Created`
```json
{
  "id": 1,
  "user_id": 1,
  "name": "US Proxy 1",
  "host": "192.168.1.100",
  "port": 8080,
  "username": "user123",
  "password": "pass123",
  "type": "http",
  "status": "active",
  "country": "United States",
  "city": "New York",
  "notes": "High speed proxy",
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z"
}
```

### 3. Lấy thông tin Proxy

**GET** `/proxies/{id}`

Lấy thông tin chi tiết của một proxy.

**Response:**
```json
{
  "id": 1,
  "user_id": 1,
  "name": "US Proxy 1",
  "host": "192.168.1.100",
  "port": 8080,
  "username": "user123",
  "password": "pass123",
  "type": "http",
  "status": "active",
  "country": "United States",
  "city": "New York",
  "notes": "High speed proxy",
  "last_used_at": "2024-01-15T10:30:00Z",
  "last_tested_at": "2024-01-15T09:00:00Z",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-15T10:30:00Z",
  "user": {
    "id": 1,
    "name": "John Doe"
  }
}
```

### 4. Cập nhật Proxy

**PUT/PATCH** `/proxies/{id}`

Cập nhật thông tin proxy.

**Request Body:**
```json
{
  "name": "Updated US Proxy",
  "status": "inactive",
  "notes": "Updated notes"
}
```

**Response:**
```json
{
  "id": 1,
  "name": "Updated US Proxy",
  "status": "inactive",
  "notes": "Updated notes",
  "updated_at": "2024-01-15T11:00:00Z"
}
```

### 5. Xóa Proxy

**DELETE** `/proxies/{id}`

Xóa proxy.

**Response:** `204 No Content`

### 6. Test Connection

**POST** `/proxies/{id}/test-connection`

Test kết nối proxy và cập nhật trạng thái.

**Response:**
```json
{
  "success": true,
  "message": "Proxy connection successful",
  "response_time": "150ms"
}
```

### 7. Lấy Active Proxies

**GET** `/proxies/active`

Lấy danh sách proxy đang hoạt động của user hiện tại.

**Response:**
```json
[
  {
    "id": 1,
    "name": "US Proxy 1",
    "host": "192.168.1.100",
    "port": 8080,
    "type": "http",
    "status": "active"
  }
]
```

### 8. Bulk Operations

#### Bulk Delete
**POST** `/proxies/bulk-delete`

Xóa nhiều proxy cùng lúc.

**Request Body:**
```json
{
  "ids": [1, 2, 3]
}
```

#### Bulk Update Status
**POST** `/proxies/bulk-update-status`

Cập nhật trạng thái nhiều proxy cùng lúc.

**Request Body:**
```json
{
  "ids": [1, 2, 3],
  "status": "inactive"
}
```

### 9. Import Proxies

**POST** `/proxies/import`

Import nhiều proxy từ danh sách.

**Request Body:**
```json
{
  "user_id": 1,
  "proxies": [
    {
      "name": "Proxy 1",
      "host": "192.168.1.100",
      "port": 8080,
      "username": "user1",
      "password": "pass1",
      "type": "http",
      "country": "United States"
    },
    {
      "name": "Proxy 2",
      "host": "192.168.1.101",
      "port": 8081,
      "type": "https",
      "country": "Canada"
    }
  ]
}
```

**Response:**
```json
{
  "message": "Import completed. 2 proxies imported, 0 errors.",
  "data": {
    "imported": [...],
    "errors": [],
    "total_imported": 2,
    "total_errors": 0
  }
}
```

### 10. Statistics

**GET** `/proxies/stats`

Lấy thống kê về proxy.

**Response:**
```json
{
  "data": {
    "total": 10,
    "active": 8,
    "inactive": 1,
    "error": 1,
    "active_rate": 80.0,
    "type_distribution": [
      {
        "type": "http",
        "count": 6
      },
      {
        "type": "https",
        "count": 4
      }
    ],
    "country_distribution": [
      {
        "country": "United States",
        "count": 7
      },
      {
        "country": "Canada",
        "count": 3
      }
    ]
  }
}
```

### 11. Get Full URL

**GET** `/proxies/{id}/full-url`

Lấy URL đầy đủ của proxy.

**Response:**
```json
{
  "proxy_id": 1,
  "full_url": "http://user123:pass123@192.168.1.100:8080",
  "type": "http",
  "host": "192.168.1.100",
  "port": 8080,
  "has_auth": true
}
```

## Error Responses

### 400 Bad Request
```json
{
  "message": "The given data was invalid.",
  "errors": {
    "host": ["The host field is required."],
    "port": ["The port must be between 1 and 65535."]
  }
}
```

### 403 Forbidden
```json
{
  "message": "Unauthorized"
}
```

### 404 Not Found
```json
{
  "message": "Proxy not found"
}
```

### 422 Unprocessable Entity
```json
{
  "message": "Import completed. 0 proxies imported, 2 errors.",
  "data": {
    "errors": [
      "Proxy 192.168.1.100:8080 already exists",
      "Error importing proxy at index 1: Host/IP is required"
    ]
  }
}
```

## Permissions

Các quyền cần thiết:
- `proxies.view`: Xem danh sách và chi tiết proxy
- `proxies.create`: Tạo proxy mới
- `proxies.edit`: Cập nhật proxy và test connection
- `proxies.delete`: Xóa proxy
- `proxies.bulk-operations`: Thực hiện bulk operations

## Notes

1. **User Isolation**: User thường chỉ có thể thấy và quản lý proxy của mình. Admin có thể thấy tất cả.
2. **Proxy Types**: Hỗ trợ 4 loại proxy: http, https, socks4, socks5
3. **Status**: 3 trạng thái: active, inactive, error
4. **Authentication**: Proxy có thể có hoặc không có username/password
5. **Full URL**: Accessor `full_url` tự động tạo URL đầy đủ với authentication nếu có
6. **Testing**: API test connection sẽ cập nhật trạng thái proxy dựa trên kết quả test

# API Facebook Device Management - Chỉ cập nhật

## Tổng quan
API này chỉ cho phép cập nhật `follower_count` và `username` của tài khoản Facebook cho các thiết bị. Yêu cầu xác thực bằng Sanctum token và tự động validate quyền sở hữu dựa trên user đang đăng nhập.

## Endpoint

### Cập nhật follower_count và username của tài khoản Facebook

**PUT** `/api/app/devices/{deviceId}/facebook-accounts/{facebookAccountId}`

#### Request Body:
```json
{
    "follower_count": "integer (required) - Số lượng người theo dõi",
    "username": "string (required) - Username của tài khoản"
}
```

#### Response:
```json
{
    "success": true,
    "message": "Thông tin tài khoản Facebook đã được cập nhật thành công",
    "data": {
        "facebook_account": {
            "id": 1,
            "username": "updated_username",
            "name": "Example User",
            "email": "user@example.com",
            "status": "active",
            "device_id": 1,
            "user_id": 1,
            "follower_count": 1500,
            "notes": "Ghi chú",
            "last_activity": "2024-01-01T00:00:00.000000Z",
            "updated_at": "2024-01-01T00:00:00.000000Z"
        }
    }
}
```

#### Validation Rules:
- `follower_count`: Bắt buộc, số nguyên >= 0
- `username`: Bắt buộc, tối đa 255 ký tự

## Xử lý lỗi

### 404 - Không tìm thấy
```json
{
    "success": false,
    "message": "Thiết bị không tồn tại"
}
```

### 403 - Không có quyền
```json
{
    "success": false,
    "message": "Bạn không có quyền cập nhật tài khoản Facebook của thiết bị này"
}
```

### 422 - Dữ liệu không hợp lệ
```json
{
    "success": false,
    "message": "Dữ liệu không hợp lệ",
    "errors": {
        "follower_count": ["Trường follower_count là bắt buộc"],
        "username": ["Trường username là bắt buộc"]
    }
}
```

## Ví dụ sử dụng

### Cập nhật follower_count và username:
```bash
curl -X PUT "https://your-domain.com/api/app/devices/device123/facebook-accounts/1" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "follower_count": 1500,
    "username": "new_username"
  }'
```

## Lưu ý quan trọng

1. **Xác thực**: API yêu cầu Sanctum token
2. **Quyền sở hữu**: Tự động kiểm tra user đăng nhập có phải là chủ sở hữu của device không
3. **Bảo mật**: Không cần truyền user_id trong request, API tự động lấy từ token
4. **Đơn giản**: Chỉ cập nhật 2 trường: `follower_count` và `username`
5. **Event**: Khi cập nhật thành công, sẽ bắn event để refresh bảng tài khoản Facebook
6. **Device ID**: Sử dụng `device_id` (string) thay vì `id` (integer) để tìm device
7. **Phân quyền**: Chỉ cho phép cập nhật tài khoản Facebook thuộc về user đăng nhập

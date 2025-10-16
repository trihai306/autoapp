# UI Tham Gia Nhóm Facebook

## 📋 Tổng quan

UI cho phép người dùng gửi yêu cầu tham gia các nhóm Facebook từ một tài khoản Facebook cụ thể với các tùy chọn cấu hình linh hoạt.

## 🎯 Tính năng

### 1. **Thêm nhiều nhóm**
- Nhập link nhóm Facebook
- Nhập tên nhóm (tùy chọn)
- Thêm/xóa nhóm động

### 2. **Cài đặt nâng cao**
- **Số nhóm tối đa**: Giới hạn số lượng nhóm tham gia
- **Độ trễ giữa các lần**: Thời gian chờ giữa các lần tham gia (ms)
- **Độ trễ ngẫu nhiên**: Thêm độ trễ ngẫu nhiên để tránh phát hiện bot
  - Thời gian tối thiểu (ms)
  - Thời gian tối đa (ms)
- **Bỏ qua nếu đã là thành viên**: Tự động bỏ qua các nhóm đã tham gia
- **Bỏ qua nếu đã gửi yêu cầu**: Không gửi lại yêu cầu đang chờ duyệt
- **Thử lại khi thất bại**: Tự động thử lại khi gặp lỗi
  - Số lần thử lại tối đa

## 🚀 Cách sử dụng

### Bước 1: Mở Modal
1. Vào trang **Quản lý tài khoản Facebook**
2. Tìm tài khoản muốn tham gia nhóm
3. Click vào icon **Tham gia nhóm** (icon nhóm người - màu xanh)

### Bước 2: Nhập thông tin nhóm
1. **Nhập link nhóm**: 
   - Format: `https://www.facebook.com/groups/123456789`
   - Hoặc: `https://fb.com/groups/group-name`
2. **Nhập tên nhóm** (tùy chọn):
   - Giúp dễ quản lý và theo dõi
3. **Thêm nhiều nhóm**:
   - Click nút **"Thêm nhóm"** để thêm nhóm mới
   - Click icon **Thùng rác** để xóa nhóm

### Bước 3: Cấu hình nâng cao (tùy chọn)
1. Click **"Hiện cài đặt nâng cao"**
2. Điều chỉnh các thông số:
   ```
   - Số nhóm tối đa: 10 (mặc định)
   - Độ trễ: 3000ms (3 giây)
   - Độ trễ ngẫu nhiên: 2000ms - 5000ms
   - Số lần thử lại: 3 lần
   ```

### Bước 4: Gửi yêu cầu
1. Kiểm tra lại thông tin
2. Click nút **"Tham gia nhóm"**
3. Đợi hệ thống xử lý
4. Nhận thông báo kết quả

## 📸 Giao diện

### Modal Tham gia nhóm
```
┌────────────────────────────────────────────┐
│  👥 Tham gia nhóm Facebook                │
│  Tài khoản: username123                    │
├────────────────────────────────────────────┤
│                                            │
│  Danh sách nhóm              [+ Thêm nhóm]│
│                                            │
│  Link nhóm 1                               │
│  ┌──────────────────────────────┐  🗑️     │
│  │ https://facebook.com/groups/ │         │
│  └──────────────────────────────┘         │
│  Tên nhóm (tùy chọn)                       │
│  ┌──────────────────────────────┐         │
│  │ Tên nhóm...                  │         │
│  └──────────────────────────────┘         │
│                                            │
│  ▼ Hiện cài đặt nâng cao                  │
│  ┌──────────────────────────────────────┐ │
│  │ Số nhóm tối đa: [10]                 │ │
│  │ Độ trễ giữa các lần: [3000] ms       │ │
│  │ ☑ Độ trễ ngẫu nhiên                  │ │
│  │   Tối thiểu: [2000] ms               │ │
│  │   Tối đa: [5000] ms                  │ │
│  │ ☑ Bỏ qua nếu đã là thành viên        │ │
│  │ ☑ Bỏ qua nếu đã gửi yêu cầu          │ │
│  │ ☑ Thử lại khi thất bại               │ │
│  │   Số lần thử lại: [3]                │ │
│  └──────────────────────────────────────┘ │
│                                            │
│              [Hủy]  [👥 Tham gia nhóm]    │
└────────────────────────────────────────────┘
```

## 🎨 Component Structure

```
FacebookAccountListTable
  └─ FacebookJoinGroupModal
      ├─ Dialog
      ├─ FormContainer
      │   ├─ Groups Input (Dynamic)
      │   └─ Advanced Settings
      └─ Action Buttons
```

## 📁 Files Created

### Frontend Components
- `FacebookJoinGroupModal.jsx` - Modal component
- Updated `FacebookAccountListTable.jsx` - Added Join Group button

### Server Actions
- `runFacebookJoinGroup.js` - Server action handler

### Services
- Updated `FacebookAccountService.js` - Added `runFacebookJoinGroupService`

## 🔌 API Integration

### Endpoint
```javascript
POST /api/facebook-accounts/interactions/run
```

### Payload
```javascript
{
  "interaction_type": "join_group",
  "account_id": 123,
  "groups": [
    {
      "link": "https://www.facebook.com/groups/123456789",
      "name": "Group Name"
    }
  ],
  "config": {
    "maxGroups": 10,
    "delayBetweenJoins": 3000,
    "randomDelay": true,
    "randomDelayMin": 2000,
    "randomDelayMax": 5000,
    "skipIfMember": true,
    "skipIfRequestPending": true,
    "retryFailedJoins": true,
    "maxRetries": 3
  }
}
```

### Response
```javascript
{
  "success": true,
  "message": "Đã gửi yêu cầu tham gia 5 nhóm thành công!",
  "data": {
    "tasks_created": 5,
    "estimated_time": "15 seconds"
  }
}
```

## 🎯 Best Practices

### 1. **Link Format**
- ✅ Sử dụng link đầy đủ: `https://www.facebook.com/groups/123456789`
- ✅ Hoặc: `https://www.facebook.com/groups/group-name`
- ❌ Tránh: `facebook.com/groups/...` (thiếu https://)

### 2. **Số lượng nhóm**
- Nên tham gia **5-10 nhóm/lần** để tránh spam
- Đợi **5-10 phút** giữa các lần chạy

### 3. **Độ trễ**
- **Tối thiểu 2 giây** giữa các lần tham gia
- **Nên dùng độ trễ ngẫu nhiên** để giảm nguy cơ bị phát hiện
- **Độ trễ ngẫu nhiên**: 2000ms - 5000ms

### 4. **Retry Logic**
- **Bật retry** cho các nhóm quan trọng
- **Giới hạn retry**: 2-3 lần
- **Tăng độ trễ** sau mỗi lần retry

## 🐛 Troubleshooting

### Lỗi: "Link nhóm không hợp lệ"
**Giải pháp:**
- Kiểm tra format link
- Đảm bảo có `facebook.com/groups/` trong link
- Copy link trực tiếp từ thanh địa chỉ

### Lỗi: "Không thể gửi yêu cầu"
**Giải pháp:**
- Kiểm tra kết nối internet
- Kiểm tra trạng thái tài khoản Facebook
- Đảm bảo tài khoản không bị khóa

### Lỗi: "Tài khoản đã là thành viên"
**Giải pháp:**
- Bật option "Bỏ qua nếu đã là thành viên"
- Hoặc kiểm tra lại danh sách nhóm

## 🔒 Security & Privacy

- **Mã hóa dữ liệu**: Tất cả thông tin được mã hóa khi truyền
- **Rate Limiting**: Giới hạn số lượng request để tránh spam
- **Validation**: Kiểm tra tính hợp lệ của link trước khi gửi
- **Error Handling**: Xử lý lỗi an toàn, không lộ thông tin nhạy cảm

## 📊 Performance

- **Lazy Loading**: Chỉ load modal khi cần
- **Optimized Rendering**: Sử dụng React hooks hiệu quả
- **Debouncing**: Tránh gọi API quá nhiều lần
- **Caching**: Cache danh sách nhóm đã join

## 🎓 Tips & Tricks

1. **Tạo template nhóm**: Lưu danh sách nhóm thường dùng
2. **Sử dụng batch**: Tham gia nhiều nhóm cùng lúc
3. **Monitor tasks**: Theo dõi tiến độ qua Tasks Modal
4. **Schedule**: Đặt lịch tham gia vào giờ thấp điểm
5. **Rotate accounts**: Luân phiên các tài khoản để tránh spam

## 🔄 Updates & Changelog

### Version 1.0.0 (2025-10-13)
- ✨ Initial release
- ✅ Multiple groups support
- ✅ Advanced configuration
- ✅ Retry logic
- ✅ Random delay
- ✅ Skip duplicates

## 📞 Support

Nếu gặp vấn đề, vui lòng:
1. Kiểm tra documentation
2. Xem phần Troubleshooting
3. Liên hệ support team
4. Report bug qua GitHub Issues

---

**Developed with ❤️ by TiktokMMO Team**


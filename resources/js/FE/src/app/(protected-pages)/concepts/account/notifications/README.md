# Trang Thông Báo (Notifications)

Trang này hiển thị danh sách tất cả thông báo của người dùng, được xây dựng dựa trên `NotificationController.php` từ backend.

## Tính năng

- **Hiển thị danh sách thông báo**: Hiển thị tất cả thông báo với phân trang
- **Lọc thông báo**: Lọc theo loại thông báo (nạp tiền, task hoàn thành, task thất bại, chung)
- **Chế độ chỉ hiển thị chưa đọc**: Chuyển đổi giữa hiển thị tất cả và chỉ thông báo chưa đọc
- **Đánh dấu đã đọc**: Đánh dấu từng thông báo hoặc tất cả thông báo là đã đọc
- **Xóa thông báo**: Xóa từng thông báo hoặc xóa tất cả thông báo chưa đọc
- **Tải thêm**: Tải thêm thông báo cũ hơn
- **Đa ngôn ngữ**: Hỗ trợ tiếng Việt và tiếng Anh

## Cấu trúc thư mục

```
notifications/
├── _components/
│   ├── NotificationProvider.jsx      # Provider component để quản lý state
│   ├── NotificationList.jsx          # Component chính hiển thị danh sách
│   ├── NotificationItem.jsx          # Component hiển thị từng thông báo
│   └── NotificationAction.jsx        # Component xử lý các hành động
├── _store/
│   └── notificationStore.js          # Zustand store để quản lý state
├── page.jsx                          # Trang chính
└── README.md                         # File hướng dẫn này
```

## Cách sử dụng

1. **Truy cập trang**: `/concepts/account/notifications`
2. **Xem thông báo**: Danh sách thông báo sẽ được hiển thị tự động
3. **Lọc thông báo**: Sử dụng dropdown filter để lọc theo loại
4. **Chế độ chỉ hiển thị chưa đọc**: Bật/tắt switch để chỉ hiển thị thông báo chưa đọc
5. **Đánh dấu đã đọc**: Click vào nút check để đánh dấu thông báo đã đọc
6. **Xóa thông báo**: Click vào nút trash để xóa thông báo
7. **Tải thêm**: Click "Tải thêm" để xem thông báo cũ hơn

## API Endpoints

Trang này sử dụng các API endpoints từ `NotificationController.php`:

- `GET /api/notifications` - Lấy danh sách thông báo
- `POST /api/notifications/{id}/mark-read` - Đánh dấu thông báo đã đọc
- `POST /api/notifications/mark-all-read` - Đánh dấu tất cả thông báo đã đọc
- `DELETE /api/notifications/{id}` - Xóa thông báo
- `POST /api/notifications/bulk-delete` - Xóa nhiều thông báo

## State Management

Sử dụng Zustand store (`notificationStore.js`) để quản lý:

- `data`: Danh sách thông báo
- `loadable`: Có thể tải thêm thông báo hay không
- `initialLoading`: Trạng thái loading ban đầu

## Dependencies

- React 18+
- Next.js 13+
- Zustand (state management)
- Tailwind CSS (styling)
- React Icons (icons)
- Day.js (date formatting)
- Next-intl (internationalization)

## Tùy chỉnh

### Thêm loại thông báo mới

1. Cập nhật `getNotificationIcon()` và `getNotificationTypeLabel()` trong `NotificationItem.jsx`
2. Thêm vào `filterItems` trong `NotificationAction.jsx`
3. Cập nhật file ngôn ngữ trong `messages/modules/account/`

### Thay đổi giao diện

- Sửa đổi CSS classes trong các component
- Thay đổi layout trong `NotificationList.jsx`
- Cập nhật icons trong `NotificationItem.jsx`

## Troubleshooting

### Thông báo không hiển thị
- Kiểm tra API endpoint có hoạt động không
- Kiểm tra authentication token
- Kiểm tra console để xem lỗi

### Lỗi đánh dấu đã đọc
- Kiểm tra quyền truy cập API
- Kiểm tra format của notification ID

### Lỗi xóa thông báo
- Kiểm tra quyền xóa
- Kiểm tra notification có tồn tại không

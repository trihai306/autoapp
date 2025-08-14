# Real-time Notifications Integration

## Tổng quan
Tích hợp real-time notifications vào header của ứng dụng sử dụng Laravel Reverb và WebSockets.

## Các thành phần đã được tích hợp

### 1. Notification Component (Header Dropdown)
**File:** `src/components/template/Notification/Notification.jsx`

**Tính năng mới:**
- ✅ Real-time notifications từ Laravel Reverb
- ✅ Hiển thị notifications real-time với styling đặc biệt
- ✅ Toast notifications khi nhận được events
- ✅ Kết hợp database notifications với real-time notifications
- ✅ Auto-refresh unread count

**Cách hoạt động:**
```javascript
// Listen to real-time notifications
const { 
    listenToGeneralNotifications, 
    listenToUserNotifications, 
    stopListeningToNotifications 
} = useNotifications(session?.user?.id)

// Combine database + real-time notifications
const allNotifications = [
    ...realtimeNotifications,
    ...(notifications?.data || [])
]
```

### 2. RealtimeStatus Component
**File:** `src/components/template/RealtimeStatus.jsx`

**Tính năng:**
- ✅ Hiển thị trạng thái kết nối real-time
- ✅ Icon WiFi xanh khi connected, đỏ khi disconnected
- ✅ Tooltip hiển thị trạng thái
- ✅ Auto-refresh mỗi 5 giây

### 3. RealtimeToastProvider
**File:** `src/components/shared/RealtimeToastProvider.jsx`

**Tính năng:**
- ✅ Wrapper component cho real-time features
- ✅ Tự động cleanup listeners
- ✅ Có thể mở rộng cho các loại events khác

## Layout Integration

### Các layout đã được cập nhật:
1. **TopBarClassic** - Thêm RealtimeStatus trước Notification
2. **CollapsibleSide** - Thêm RealtimeStatus trước Notification  
3. **StackedSide** - Thêm RealtimeStatus trước Notification
4. **ContentOverlay** - Thêm RealtimeStatus trước Notification
5. **PostLoginLayoutClient** - Wrap với RealtimeToastProvider

### Thứ tự components trong header:
```jsx
headerEnd={
    <>
        <LanguageSelector />
        <RealtimeStatus />      // ← Mới thêm
        <Notification />        // ← Đã cập nhật
        <SidePanel />
        <UserProfileDropdown />
    </>
}
```

## Styling và UX

### Real-time Notifications Styling:
```css
/* Real-time notifications có styling đặc biệt */
.realtime-notification {
    background: bg-blue-50 dark:bg-blue-900/20;
    border-left: 4px solid #3B82F6;
}

/* Badge "Real-time" */
.realtime-badge {
    background: #DBEAFE;
    color: #1E40AF;
    font-size: 0.75rem;
    padding: 0.125rem 0.5rem;
    border-radius: 9999px;
}
```

### Toast Notifications Colors:
- **General notifications:** Default success green
- **User notifications:** Blue (#3B82F6)

## Events được hỗ trợ

### 1. General Notifications
**Channel:** `notifications` (public)
**Event:** `notification.sent`

```javascript
// Tự động hiển thị trong dropdown và toast
listenToGeneralNotifications((notification) => {
    // Thêm vào dropdown
    // Hiển thị toast
})
```

### 2. User-specific Notifications  
**Channel:** `user.{userId}` (private)
**Event:** `notification.sent`

```javascript
// Notifications riêng cho user
listenToUserNotifications((notification) => {
    // Thêm vào dropdown với styling đặc biệt
    // Hiển thị toast màu xanh
    // Refresh unread count
})
```

### 3. Mở rộng cho các Events khác
Có thể dễ dàng thêm các events khác như:
- TikTok account updates
- Transaction status changes
- System notifications
- User activity updates

## Cách sử dụng

### 1. Notifications tự động hoạt động
Không cần setup gì thêm, notifications sẽ tự động:
- Kết nối khi user login
- Hiển thị real-time notifications
- Show toast notifications
- Update unread count

### 2. Sử dụng trong ứng dụng
Real-time notifications sẽ tự động hoạt động khi có events được trigger từ backend.

### 3. Kiểm tra connection status
- Icon WiFi xanh = Connected
- Icon WiFi đỏ = Disconnected
- Hover để xem tooltip

## Troubleshooting

### Notifications không hiển thị:
1. ✅ Kiểm tra connection status (icon WiFi)
2. ✅ Kiểm tra browser console cho errors
3. ✅ Verify user đã login
4. ✅ Check Reverb server đang chạy

### Toast không hiển thị:
1. ✅ Kiểm tra RealtimeToastProvider đã được wrap
2. ✅ Check browser console cho errors
3. ✅ Verify events đang được trigger

### Styling issues:
1. ✅ Check Tailwind classes được load
2. ✅ Verify dark mode support
3. ✅ Check responsive design

## Performance

### Optimizations đã implement:
- ✅ Chỉ listen khi user authenticated
- ✅ Auto cleanup listeners on unmount
- ✅ Limit real-time notifications (max 10)
- ✅ Debounced connection status check
- ✅ Efficient re-renders với useCallback

### Memory management:
- ✅ Clear real-time notifications khi mark all as read
- ✅ Remove individual real-time notifications
- ✅ Proper cleanup trong useEffect

## Browser Support
- ✅ Chrome/Edge (WebSocket support)
- ✅ Firefox (WebSocket support)  
- ✅ Safari (WebSocket support)
- ✅ Mobile browsers

## Security
- ✅ Private channels require authentication
- ✅ User-specific notifications chỉ gửi đến đúng user
- ✅ Broadcasting auth middleware
- ✅ Token validation

## Kết luận

Real-time notifications đã được tích hợp thành công vào header với:
- ✅ Real-time notifications trong dropdown
- ✅ Connection status indicator  
- ✅ Responsive design và dark mode support
- ✅ Performance optimized và proper error handling
- ✅ Dễ dàng mở rộng cho các loại events khác

Users sẽ nhận được notifications real-time ngay lập tức thông qua header dropdown.

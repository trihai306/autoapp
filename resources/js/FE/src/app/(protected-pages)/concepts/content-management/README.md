# Content Management Module

Một module quản lý content và group content với giao diện grid hiện đại, được thiết kế để dễ sử dụng và dễ tạo.

## Tính năng chính

### 🎯 Giao diện Grid
- Hiển thị content groups dưới dạng grid cards thay vì table truyền thống
- Responsive design với Tailwind CSS
- Animations mượt mà và transitions

### 📱 Sidebar động
- Khi click vào content group, bên phải sẽ hiện sidebar dọc
- Hiển thị danh sách content của group đã chọn
- Tìm kiếm content trong sidebar
- Thêm content mới trực tiếp từ sidebar

### ✨ UX/UI Features
- Hover effects với scale và shadow
- Loading states với skeleton screens
- Toast notifications cho user feedback
- Modal forms cho tạo/chỉnh sửa
- Dark mode support

## Cấu trúc Components

```
content-management/
├── page.jsx                           # Main page entry
├── _components/
│   ├── ContentManagementClient.jsx    # Main client component
│   ├── ContentManagementHeader.jsx    # Header với actions
│   ├── ContentGroupGrid.jsx           # Grid hiển thị groups
│   ├── ContentGroupCard.jsx           # Card component cho group
│   ├── ContentSidebar.jsx             # Sidebar hiển thị contents
│   ├── ContentItem.jsx                # Item component cho content
│   ├── CreateContentGroupModal.jsx    # Modal tạo group
│   ├── CreateContentModal.jsx         # Modal tạo content
│   ├── EditContentGroupModal.jsx      # Modal sửa group
│   └── EditContentModal.jsx           # Modal sửa content
├── _store/
│   └── contentManagementStore.js      # Zustand store
└── README.md                          # Documentation
```

## API Services

```
services/content/
├── ContentGroupService.js             # API calls cho content groups
└── ContentService.js                  # API calls cho contents
```

## State Management

Sử dụng Zustand store với các state chính:

- `contentGroups`: Danh sách content groups
- `contents`: Danh sách contents của group đã chọn
- `selectedContentGroup`: Group hiện tại được chọn
- `isContentSidebarOpen`: Trạng thái sidebar
- Loading states và modal states

## Cách sử dụng

### 1. Quản lý Content Groups
- **Xem danh sách**: Grid hiển thị tất cả content groups
- **Tìm kiếm**: Sử dụng search bar để tìm groups
- **Tạo mới**: Click "Tạo nhóm mới" ở header
- **Chỉnh sửa**: Click menu 3 chấm trên card → "Chỉnh sửa"
- **Xóa**: Click menu 3 chấm trên card → "Xóa"

### 2. Quản lý Contents
- **Xem contents**: Click vào content group card
- **Sidebar mở**: Hiển thị danh sách contents bên phải
- **Tìm kiếm**: Sử dụng search trong sidebar
- **Tạo content**: Click "Thêm" trong sidebar hoặc header
- **Chỉnh sửa**: Click menu 3 chấm trên content item → "Chỉnh sửa"
- **Xóa**: Click menu 3 chấm trên content item → "Xóa"

### 3. Animations & Interactions
- **Hover effects**: Cards có scale và shadow khi hover
- **Selected state**: Group được chọn có highlight và scale
- **Sidebar animation**: Slide in/out từ bên phải
- **Loading states**: Spinner và skeleton screens
- **Toast notifications**: Success/error messages

## Permissions

Module yêu cầu các permissions sau:
- `content-groups.view`: Xem content groups
- `content-groups.create`: Tạo content groups
- `content-groups.edit`: Sửa content groups
- `content-groups.delete`: Xóa content groups
- `contents.view`: Xem contents
- `contents.create`: Tạo contents
- `contents.edit`: Sửa contents
- `contents.delete`: Xóa contents

## API Endpoints

### Content Groups
- `GET /api/content-groups` - Lấy danh sách groups
- `POST /api/content-groups` - Tạo group mới
- `PUT /api/content-groups/{id}` - Cập nhật group
- `DELETE /api/content-groups/{id}` - Xóa group
- `POST /api/content-groups/bulk-delete` - Xóa nhiều groups

### Contents
- `GET /api/contents` - Lấy danh sách contents
- `GET /api/content-groups/{id}/contents` - Lấy contents của group
- `POST /api/contents` - Tạo content mới
- `PUT /api/contents/{id}` - Cập nhật content
- `DELETE /api/contents/{id}` - Xóa content
- `POST /api/contents/bulk-delete` - Xóa nhiều contents

## Responsive Design

- **Mobile**: Stack layout, sidebar overlay
- **Tablet**: 2-3 columns grid
- **Desktop**: 4+ columns grid với sidebar

## Dark Mode

Tự động support dark mode theo theme của app:
- Colors tự động chuyển đổi
- Icons và borders adapt
- Consistent với design system

## Performance

- **Lazy loading**: Components chỉ render khi cần
- **Optimized re-renders**: Zustand store tối ưu
- **Debounced search**: Tránh API calls liên tục
- **Cached data**: Store data để tránh fetch lại

## Customization

### Thay đổi animations
```jsx
// Trong ContentGroupCard.jsx
className="transition-all duration-300 ease-in-out hover:shadow-xl transform hover:-translate-y-2 hover:scale-105"
```

### Thay đổi colors
```jsx
// Sử dụng Tailwind CSS variables
className="bg-primary hover:bg-primary-dark"
```

### Thay đổi layout
```jsx
// Trong ContentGroupGrid.jsx
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
```

## Troubleshooting

### Sidebar không hiển thị
- Kiểm tra `selectedContentGroup` trong store
- Đảm bảo `isContentSidebarOpen` = true

### API calls fail
- Kiểm tra permissions
- Verify API endpoints trong Laravel routes
- Check authentication token

### Animations không mượt
- Đảm bảo Tailwind CSS đã compile
- Kiểm tra browser support cho CSS transforms

## Future Enhancements

- [ ] Drag & drop để sắp xếp
- [ ] Bulk operations cho multiple selection
- [ ] Advanced filters và sorting
- [ ] Export/Import functionality
- [ ] Real-time updates với WebSocket
- [ ] Content preview trong sidebar
- [ ] Rich text editor cho content
- [ ] File attachments support

# Action Modals

Thư mục này chứa tất cả các modal con của "Danh sách hành động" trong tính năng Cấu hình Tương tác TikTok.

## 📁 Cấu trúc

```
action-modals/
├── index.js                           # Export tất cả modal
├── ActionConfigModal.jsx              # Modal cấu hình chung
├── VideoInteractionModal.jsx          # Modal tương tác video ngẫu nhiên
├── SpecificVideoInteractionModal.jsx  # Modal tương tác video chỉ định
├── KeywordVideoInteractionModal.jsx   # Modal tương tác video theo từ khóa
├── UserVideoInteractionModal.jsx      # Modal tương tác video theo user
├── RandomLiveInteractionModal.jsx     # Modal tương tác live ngẫu nhiên
├── SpecificLiveInteractionModal.jsx   # Modal tương tác live chỉ định
├── FollowBackModal.jsx               # Modal theo dõi user và theo dõi lại
├── CreatePostModal.jsx               # Modal tạo bài viết
└── README.md                          # Tài liệu này
```

## 🎯 Mục đích

Các modal này được sử dụng để cấu hình chi tiết cho từng loại hành động khác nhau trong kịch bản tương tác TikTok:

### 📹 **Video Interaction Modals**
- **VideoInteractionModal**: Cấu hình tương tác với video ngẫu nhiên trên For You page
- **SpecificVideoInteractionModal**: Cấu hình tương tác với video cụ thể theo URL
- **KeywordVideoInteractionModal**: Cấu hình tương tác với video theo từ khóa tìm kiếm
- **UserVideoInteractionModal**: Cấu hình tương tác với video của user cụ thể

### 🔴 **Live Interaction Modals**
- **RandomLiveInteractionModal**: Cấu hình tương tác với live stream ngẫu nhiên
- **SpecificLiveInteractionModal**: Cấu hình tương tác với live stream cụ thể

### 👥 **Follow Interaction Modals**
- **FollowBackModal**: Cấu hình theo dõi user và theo dõi lại

### 📝 **Content Creation Modals**
- **CreatePostModal**: Cấu hình tạo bài viết với ảnh, video và filter

### ⚙️ **General Configuration**
- **ActionConfigModal**: Modal cấu hình chung cho các hành động khác

## 🚀 Cách sử dụng

### Import từ index file:
```javascript
import {
    ActionConfigModal,
    VideoInteractionModal,
    SpecificVideoInteractionModal,
    // ... các modal khác
} from './action-modals'
```

### Import riêng lẻ:
```javascript
import ActionConfigModal from './action-modals/ActionConfigModal'
import VideoInteractionModal from './action-modals/VideoInteractionModal'
```

## 🔧 Props chung

Tất cả các modal đều có các props cơ bản:

```javascript
{
    isOpen: boolean,        // Trạng thái mở/đóng modal
    onClose: function,      // Hàm xử lý khi đóng modal
    action: object,         // Thông tin hành động đang cấu hình
    onSave: function        // Hàm xử lý khi lưu cấu hình
}
```

## 📊 Modal Specifications

### **Kích thước Modal:**
- **InteractionConfigModal**: `1200px` (Modal chính)
- **ActionListModal**: `1200px` (Modal danh sách hành động)
- **Action Config Modals**: `800px` (Tất cả modal cấu hình - **thống nhất**)

### **Z-index Hierarchy:**
- **ActionListModal**: `z-[70]` (Modal danh sách hành động)
- **Action Config Modals**: `z-[80]` (Các modal cấu hình)

## 🎨 Styling

Tất cả modal sử dụng:
- **Dialog component** từ `@/components/ui/Dialog`
- **Tailwind CSS** cho styling
- **Dark mode support**
- **Responsive design**

## 🔄 Workflow

1. User mở **InteractionConfigModal**
2. Chọn kịch bản và nhấn "Thêm hành động"
3. **ActionListModal** mở với danh sách hành động
4. Chọn hành động → Modal cấu hình tương ứng mở
5. Cấu hình và lưu → Quay lại ActionListModal
6. Có thể tiếp tục thêm hành động khác

## 🛠️ Development

Khi thêm modal mới:

1. Tạo file modal trong thư mục này
2. Export trong `index.js`
3. Thêm import trong `InteractionConfigModal.jsx`
4. Thêm logic xử lý trong `handleSelectActionFromList`
5. Cập nhật README này

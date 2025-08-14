# Messages Modules Structure

Cấu trúc thư mục messages được tổ chức lại để dễ quản lý và mở rộng hơn.

## Cấu trúc thư mục

```
messages/
├── en.json                    # Messages chính (tiếng Anh)
├── vi.json                    # Messages chính (tiếng Việt)
├── ar.json                    # Messages chính (tiếng Ả Rập)
├── es.json                    # Messages chính (tiếng Tây Ban Nha)
├── zh.json                    # Messages chính (tiếng Trung)
└── modules/                   # Các module riêng biệt
    ├── tiktok-account-management/
    │   ├── en.json           # Messages TikTok Account Management (EN)
    │   └── vi.json           # Messages TikTok Account Management (VI)
    ├── account/
    │   ├── en.json           # Messages Account (EN)
    │   ├── vi.json           # Messages Account (VI)
    │   ├── ar.json           # Messages Account (AR)
    │   ├── es.json           # Messages Account (ES)
    │   └── zh.json           # Messages Account (ZH)
    ├── account-task-management/
    │   ├── en.json           # Messages Account Task Management (EN)
    │   └── vi.json           # Messages Account Task Management (VI)
    ├── auth/
    │   ├── en.json           # Messages Authentication (EN)
    │   ├── vi.json           # Messages Authentication (VI)
    │   ├── ar.json           # Messages Authentication (AR)
    │   ├── es.json           # Messages Authentication (ES)
    │   └── zh.json           # Messages Authentication (ZH)
    ├── role-management/
    │   ├── en.json           # Messages Role Management (EN)
    │   ├── vi.json           # Messages Role Management (VI)
    │   ├── ar.json           # Messages Role Management (AR)
    │   ├── es.json           # Messages Role Management (ES)
    │   └── zh.json           # Messages Role Management (ZH)
    ├── permission-management/
    │   ├── en.json           # Messages Permission Management (EN)
    │   ├── vi.json           # Messages Permission Management (VI)
    │   ├── ar.json           # Messages Permission Management (AR)
    │   ├── es.json           # Messages Permission Management (ES)
    │   └── zh.json           # Messages Permission Management (ZH)
    ├── transaction-management/
    │   ├── en.json           # Messages Transaction Management (EN)
    │   ├── vi.json           # Messages Transaction Management (VI)
    │   ├── ar.json           # Messages Transaction Management (AR)
    │   ├── es.json           # Messages Transaction Management (ES)
    │   └── zh.json           # Messages Transaction Management (ZH)
    ├── user-management/
    │   ├── en.json           # Messages User Management (EN)
    │   ├── vi.json           # Messages User Management (VI)
    │   ├── ar.json           # Messages User Management (AR)
    │   ├── es.json           # Messages User Management (ES)
    │   └── zh.json           # Messages User Management (ZH)
    └── [other-modules]/
        ├── en.json
        └── vi.json
```

## Cách sử dụng

### 1. Trong file messages chính
Các messages chung và navigation được đặt trong file messages chính:
- `en.json`, `vi.json`, `ar.json`, `es.json`, `zh.json`

### 2. Trong modules
Các messages riêng cho từng module được đặt trong thư mục `modules/`:
- Mỗi module có thư mục riêng
- Mỗi module có file messages cho từng ngôn ngữ

### 3. Cách import và sử dụng

#### Trong component:
```javascript
// Sử dụng messages chính
const t = useTranslations('nav.conceptsTiktokAccountManagement')

// Sử dụng messages module
const t = useTranslations('tiktokAccountManagement')
const t = useTranslations('account')
const t = useTranslations('auth')
const t = useTranslations('userManagement')
```

#### Trong server action:
```javascript
// Sử dụng messages chính
const t = await getTranslations('nav.conceptsTiktokAccountManagement')

// Sử dụng messages module
const t = await getTranslations('tiktokAccountManagement')
const t = await getTranslations('account')
const t = await getTranslations('auth')
const t = await getTranslations('userManagement')
```

## Quy tắc đặt tên

1. **Messages chính**: Sử dụng prefix `nav.` cho navigation
2. **Messages module**: Sử dụng tên module trực tiếp (ví dụ: `tiktokAccountManagement`, `account`, `auth`)

## Danh sách modules hiện có

- **tiktok-account-management**: Quản lý tài khoản TikTok
- **account**: Quản lý tài khoản người dùng
- **account-task-management**: Quản lý nhiệm vụ tài khoản
- **auth**: Xác thực và đăng nhập
- **role-management**: Quản lý vai trò
- **permission-management**: Quản lý quyền hạn
- **transaction-management**: Quản lý giao dịch
- **user-management**: Quản lý người dùng

## Thêm module mới

1. Tạo thư mục module trong `messages/modules/`
2. Tạo file messages cho từng ngôn ngữ
3. Thêm navigation vào file messages chính
4. Cập nhật `index.js` để export module mới
5. Cập nhật component để sử dụng messages mới

## Lợi ích

- **Tổ chức gọn gàng**: Mỗi module có messages riêng
- **Dễ bảo trì**: Không cần tìm kiếm trong file lớn
- **Mở rộng dễ dàng**: Thêm module mới không ảnh hưởng module khác
- **Tái sử dụng**: Có thể copy module messages cho dự án khác
- **Đa ngôn ngữ**: Hỗ trợ đầy đủ 5 ngôn ngữ chính 
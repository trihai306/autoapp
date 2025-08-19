# Proxy Management - Đa ngôn ngữ (i18n)

## Tổng quan

Module Proxy Management đã được triển khai hỗ trợ đa ngôn ngữ hoàn chỉnh với Next.js Intl, hỗ trợ tiếng Anh và tiếng Việt.

## Cấu trúc file

```
resources/js/FE/src/messages/proxy-management/
├── index.js          # Export các bản dịch
├── en.json          # Bản dịch tiếng Anh
└── vi.json          # Bản dịch tiếng Việt
```

## Các key đa ngôn ngữ

### 1. Các key chính
- `title`: Tiêu đề trang
- `description`: Mô tả module
- `quickSearch`: Placeholder tìm kiếm nhanh
- `filter`: Nút lọc
- `refresh`: Nút làm mới
- `addNew`: Nút thêm mới
- `import`: Nút nhập
- `export`: Nút xuất
- `bulkActions`: Thao tác hàng loạt
- `clearSelection`: Bỏ chọn
- `selected`: Số lượng đã chọn

### 2. Bảng dữ liệu (table)
- `table.name`: Tên
- `table.host`: Máy chủ
- `table.port`: Cổng
- `table.type`: Loại
- `table.status`: Trạng thái
- `table.country`: Quốc gia
- `table.city`: Thành phố
- `table.lastUsed`: Lần cuối sử dụng
- `table.lastTested`: Lần cuối kiểm tra
- `table.actions`: Thao tác

### 3. Trạng thái (status)
- `status.active`: Hoạt động
- `status.inactive`: Không hoạt động
- `status.error`: Lỗi

### 4. Loại proxy (type)
- `type.http`: HTTP
- `type.https`: HTTPS
- `type.socks4`: SOCKS4
- `type.socks5`: SOCKS5

### 5. Form
- `form.title`: Tiêu đề form
- `form.name`: Tên proxy
- `form.namePlaceholder`: Placeholder tên
- `form.host`: Máy chủ
- `form.hostPlaceholder`: Placeholder máy chủ
- `form.port`: Cổng
- `form.portPlaceholder`: Placeholder cổng
- `form.username`: Tên đăng nhập
- `form.usernamePlaceholder`: Placeholder tên đăng nhập
- `form.password`: Mật khẩu
- `form.passwordPlaceholder`: Placeholder mật khẩu
- `form.type`: Loại proxy
- `form.selectType`: Chọn loại
- `form.status`: Trạng thái
- `form.selectStatus`: Chọn trạng thái
- `form.country`: Quốc gia
- `form.countryPlaceholder`: Placeholder quốc gia
- `form.city`: Thành phố
- `form.cityPlaceholder`: Placeholder thành phố
- `form.notes`: Ghi chú
- `form.notesPlaceholder`: Placeholder ghi chú
- `form.cancel`: Hủy
- `form.save`: Lưu
- `form.update`: Cập nhật

### 6. Thao tác hàng loạt (bulkAction)
- `bulkAction.delete`: Xóa đã chọn
- `bulkAction.activate`: Kích hoạt đã chọn
- `bulkAction.deactivate`: Vô hiệu hóa đã chọn
- `bulkAction.test`: Kiểm tra đã chọn

### 7. Xác nhận xóa (deleteConfirm)
- `deleteConfirm.title`: Tiêu đề xác nhận
- `deleteConfirm.content`: Nội dung xác nhận (nhiều)
- `deleteConfirm.singleContent`: Nội dung xác nhận (một)
- `deleteConfirm.cancel`: Hủy
- `deleteConfirm.delete`: Xóa

### 8. Form lọc (filterForm)
- `filterForm.title`: Tiêu đề form lọc
- `filterForm.name`: Tên
- `filterForm.namePlaceholder`: Placeholder tên
- `filterForm.host`: Máy chủ
- `filterForm.hostPlaceholder`: Placeholder máy chủ
- `filterForm.type`: Loại
- `filterForm.selectType`: Chọn loại
- `filterForm.status`: Trạng thái
- `filterForm.selectStatus`: Chọn trạng thái
- `filterForm.country`: Quốc gia
- `filterForm.countryPlaceholder`: Placeholder quốc gia
- `filterForm.city`: Thành phố
- `filterForm.cityPlaceholder`: Placeholder thành phố
- `filterForm.cancel`: Hủy
- `filterForm.apply`: Áp dụng
- `filterForm.reset`: Đặt lại

### 9. Nhập (import)
- `import.title`: Tiêu đề nhập
- `import.description`: Mô tả
- `import.placeholder`: Placeholder
- `import.cancel`: Hủy
- `import.import`: Nhập
- `import.success`: Thành công
- `import.error`: Lỗi

### 10. Kiểm tra (test)
- `test.title`: Tiêu đề kiểm tra
- `test.testing`: Đang kiểm tra
- `test.success`: Thành công
- `test.error`: Lỗi
- `test.timeout`: Timeout

### 11. Thống kê (stats)
- `stats.title`: Tiêu đề thống kê
- `stats.total`: Tổng số
- `stats.active`: Hoạt động
- `stats.inactive`: Không hoạt động
- `stats.error`: Lỗi
- `stats.byType`: Theo loại
- `stats.byCountry`: Theo quốc gia

### 12. Thông báo (messages)
- `messages.created`: Đã tạo thành công
- `messages.updated`: Đã cập nhật thành công
- `messages.deleted`: Đã xóa thành công
- `messages.bulkDeleted`: Đã xóa hàng loạt thành công
- `messages.statusUpdated`: Đã cập nhật trạng thái thành công
- `messages.testSuccess`: Kiểm tra kết nối thành công
- `messages.testFailed`: Kiểm tra kết nối thất bại
- `messages.importSuccess`: Nhập thành công
- `messages.importFailed`: Nhập thất bại
- `messages.error`: Đã xảy ra lỗi

### 13. Validation
- `validation.nameRequired`: Tên là bắt buộc
- `validation.hostRequired`: Máy chủ là bắt buộc
- `validation.portRequired`: Cổng là bắt buộc
- `validation.portNumber`: Cổng phải là số từ 1-65535
- `validation.invalidHost`: Định dạng máy chủ không hợp lệ
- `validation.invalidPort`: Số cổng không hợp lệ

### 14. Navigation
- `navigation.proxyManagement`: Quản lý Proxy
- `navigation.proxyManagementDesc`: Mô tả quản lý proxy

## Cách sử dụng

### 1. Import hook useTranslations
```javascript
import { useTranslations } from 'next-intl'

export default function ProxyManagementPage() {
    const t = useTranslations('proxy-management')
    // ...
}
```

### 2. Sử dụng trong component
```javascript
// Text đơn giản
<h1>{t('title')}</h1>

// Text với tham số
message.success(t('messages.bulkDeleted', { count: selectedRowKeys.length }))

// Placeholder
<Input placeholder={t('quickSearch')} />

// Label form
<Form.Item label={t('form.name')}>
    <Input placeholder={t('form.namePlaceholder')} />
</Form.Item>
```

### 3. Validation rules
```javascript
rules={[{ required: true, message: t('validation.nameRequired') }]}
```

## Cấu hình i18n

### 1. Cập nhật i18n.ts
File `resources/js/FE/src/i18n.ts` đã được cập nhật để load module proxy-management:

```javascript
const proxyManagementMessages = (await import(`../messages/proxy-management/${locale}.json`)).default

return {
    // ... other modules
    ...proxyManagementMessages,
}
```

### 2. Navigation config
File `resources/js/FE/src/configs/navigation.config/management.navigation.config.js` đã được cập nhật:

```javascript
{
    key: 'management.proxyManagement',
    path: `${CONCEPTS_PREFIX_PATH}/proxy-management`,
    title: 'Proxy Management',
    translateKey: 'navigation.proxyManagement',
    // ...
    meta: {
        description: {
            translateKey: 'navigation.proxyManagementDesc',
            label: 'Manage proxy servers',
        },
    },
}
```

## Thêm ngôn ngữ mới

### 1. Tạo file bản dịch mới
Tạo file `resources/js/FE/src/messages/proxy-management/[locale].json` với cấu trúc tương tự `en.json` và `vi.json`.

### 2. Cập nhật index.js
```javascript
import en from './en.json'
import vi from './vi.json'
import [newLocale] from './[newLocale].json'

export default {
    en,
    vi,
    [newLocale],
}
```

### 3. Cập nhật i18n.ts
Thêm locale mới vào danh sách fallback nếu cần.

## Lưu ý

1. **Consistency**: Tất cả text hiển thị đều sử dụng key đa ngôn ngữ
2. **Fallback**: Hệ thống tự động fallback về tiếng Anh nếu không tìm thấy bản dịch
3. **Parameters**: Sử dụng tham số cho các message có số lượng động
4. **Validation**: Tất cả validation message đều được đa ngôn ngữ hóa
5. **Navigation**: Menu navigation cũng được đa ngôn ngữ hóa

## Testing

Để test đa ngôn ngữ:

1. Chuyển đổi ngôn ngữ trong ứng dụng
2. Kiểm tra tất cả text hiển thị đã được dịch
3. Test các message validation
4. Test các thông báo thành công/lỗi
5. Test navigation menu

## Maintenance

Khi thêm tính năng mới:

1. Thêm key mới vào cả `en.json` và `vi.json`
2. Cập nhật documentation này
3. Test với cả hai ngôn ngữ
4. Đảm bảo consistency trong naming convention

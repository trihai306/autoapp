# Changelog - Đổi tên dự án từ Ecme sang Lionsoftware

## Phiên bản 1.2.2 - [Ngày hiện tại]

### Thay đổi
- **Đổi tên dự án**: Thay đổi tên dự án từ "ecme-next" thành "lionsoftware"
- **Cập nhật tên ứng dụng**: Thay đổi APP_NAME từ "Ecme" thành "Lionsoftware"

### Files đã được cập nhật

#### Cấu hình dự án
- `package.json` - Tên dự án
- `package-lock.json` - Tự động cập nhật sau npm install
- `README.md` - Mô tả và links demo

#### Constants và Configs
- `src/constants/app.constant.js` - APP_NAME
- `src/configs/page-meta.config.js` - Title trang
- `src/configs/app.config.js` - Đã có API_BASE_URL: 'https://api.lionsoftware.vn'

#### Components và Pages
- `src/app/(public-pages)/landing/components/HeroContent.jsx` - Alt text và links
- `src/components/layouts/AuthLayout/Split.jsx` - Text mô tả

#### Documentation
- `src/app/(protected-pages)/guide/documentation/*` - Tất cả các trang hướng dẫn
- `messages/modules/account/*.json` - Email support

#### Mock Data
- `src/mock/data/authData.js` - Email admin

### Lưu ý
- Tất cả các tham chiếu đến "Ecme" đã được thay thế bằng "Lionsoftware"
- API base URL đã được cấu hình sẵn: https://api.lionsoftware.vn
- Dự án vẫn giữ nguyên cấu trúc và chức năng, chỉ thay đổi branding

### Cách sử dụng
1. Chạy `npm install` để cập nhật package-lock.json
2. Kiểm tra tất cả các thay đổi đã được áp dụng
3. Test ứng dụng để đảm bảo không có lỗi

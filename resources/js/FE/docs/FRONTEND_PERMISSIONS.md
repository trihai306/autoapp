# Frontend Permission System Documentation

## Tổng quan

Hệ thống permission Frontend được tích hợp với NextAuth và Laravel backend để kiểm soát truy cập các trang và components một cách chi tiết.

## Cấu trúc

### 1. Hooks

#### `usePermission(permission, requireAll)`
Kiểm tra quyền của user hiện tại.

```jsx
import { usePermission } from '@/utils/hooks/usePermission'

function MyComponent() {
    const canViewUsers = usePermission('users.view')
    const canManageUsers = usePermission(['users.create', 'users.edit'], true) // requireAll = true
    
    return (
        <div>
            {canViewUsers && <UserList />}
            {canManageUsers && <UserManagementPanel />}
        </div>
    )
}
```

#### `useRole(role, requireAll)`
Kiểm tra vai trò của user.

```jsx
import { useRole } from '@/utils/hooks/usePermission'

function AdminPanel() {
    const isAdmin = useRole(['admin', 'super-admin']) // User cần có ít nhất 1 trong 2 roles
    const isSuperAdmin = useRole('super-admin')
    
    if (!isAdmin) return <AccessDenied />
    
    return (
        <div>
            <h1>Admin Panel</h1>
            {isSuperAdmin && <SuperAdminFeatures />}
        </div>
    )
}
```

#### `useResourcePermissions(resource)`
Kiểm tra quyền CRUD cho một resource.

```jsx
import { useResourcePermissions } from '@/utils/hooks/usePermission'

function UserManagement() {
    const userPermissions = useResourcePermissions('users')
    
    return (
        <div>
            {userPermissions.view && <UserList />}
            {userPermissions.create && <CreateUserButton />}
            {userPermissions.edit && <EditUserButton />}
            {userPermissions.delete && <DeleteUserButton />}
        </div>
    )
}
```

#### `useUserPermissions()`
Lấy tất cả thông tin permissions của user.

```jsx
import { useUserPermissions } from '@/utils/hooks/usePermission'

function UserProfile() {
    const { roles, permissions, isAdmin, isSuperAdmin } = useUserPermissions()
    
    return (
        <div>
            <p>Roles: {roles.join(', ')}</p>
            <p>Permissions: {permissions.length}</p>
            {isAdmin && <AdminBadge />}
        </div>
    )
}
```

### 2. Components

#### `PermissionCheck`
Component để hiển thị nội dung có điều kiện dựa trên permissions.

```jsx
import { PermissionCheck } from '@/components/shared/PermissionCheck'

function Dashboard() {
    return (
        <div>
            <PermissionCheck permission="users.view">
                <UserManagementCard />
            </PermissionCheck>
            
            <PermissionCheck 
                permission={['transactions.view', 'transactions.approve']} 
                requireAll={false}
            >
                <TransactionPanel />
            </PermissionCheck>
            
            <PermissionCheck 
                role="admin" 
                fallback={<div>Admin only content</div>}
            >
                <AdminSettings />
            </PermissionCheck>
        </div>
    )
}
```

#### `ResourcePermissionCheck`
Component để kiểm tra quyền resource cụ thể.

```jsx
import { ResourcePermissionCheck } from '@/components/shared/PermissionCheck'

function UserList() {
    return (
        <div>
            <ResourcePermissionCheck resource="users" action="view">
                <UserTable />
            </ResourcePermissionCheck>
            
            <ResourcePermissionCheck resource="users" action="create">
                <CreateUserButton />
            </ResourcePermissionCheck>
        </div>
    )
}
```

#### `AdminCheck` và `SuperAdminCheck`
Components để kiểm tra quyền admin.

```jsx
import { AdminCheck, SuperAdminCheck } from '@/components/shared/PermissionCheck'

function Settings() {
    return (
        <div>
            <AdminCheck>
                <AdminSettings />
            </AdminCheck>
            
            <SuperAdminCheck fallback={<div>Super Admin required</div>}>
                <SystemSettings />
            </SuperAdminCheck>
        </div>
    )
}
```

### 3. Higher-Order Components (HOCs)

#### `withPermissionCheck`
HOC để bảo vệ toàn bộ page/component.

```jsx
import { withPermissionCheck } from '@/utils/withPermissionCheck'

function UserManagementPage() {
    return <div>User Management Content</div>
}

export default withPermissionCheck(UserManagementPage, {
    permission: 'users.view',
    redirectTo: '/access-denied'
})
```

#### `withResourcePermission`
HOC cho resource-based permissions.

```jsx
import { withResourcePermission } from '@/utils/withPermissionCheck'

function EditUserPage() {
    return <div>Edit User Form</div>
}

export default withResourcePermission(EditUserPage, 'users', 'edit')
```

#### `withAdminCheck`
HOC cho admin-only pages.

```jsx
import { withAdminCheck } from '@/utils/withPermissionCheck'

function AdminDashboard() {
    return <div>Admin Dashboard</div>
}

export default withAdminCheck(AdminDashboard)
```

### 4. Route Protection

#### Middleware Level
Routes được bảo vệ tự động bởi middleware dựa trên cấu hình trong `routePermissions.js`.

```javascript
// resources/js/FE/src/configs/routes.config/routePermissions.js
const routePermissions = {
    '/concepts/user-management': {
        permissions: ['users.view'],
        roles: [],
    },
    '/concepts/admin': {
        permissions: [],
        roles: ['admin', 'super-admin'],
    },
}
```

#### Navigation Level
Menu items được ẩn/hiện dựa trên permissions trong navigation config.

```javascript
// resources/js/FE/src/configs/navigation.config/concepts.navigation.config.js
{
    key: 'concepts.userManagement',
    path: '/concepts/user-management',
    title: 'User Management',
    permissions: ['users.view'], // Chỉ hiển thị nếu có permission
    authority: [ADMIN], // Fallback cho hệ thống cũ
}
```

### 5. AuthorityCheck Component (Updated)
Component AuthorityCheck đã được cập nhật để hỗ trợ cả hệ thống permission mới và authority cũ.

```jsx
import AuthorityCheck from '@/components/shared/AuthorityCheck'

function Navigation() {
    return (
        <nav>
            {/* Sử dụng permission mới */}
            <AuthorityCheck permissions={['users.view']}>
                <NavItem>User Management</NavItem>
            </AuthorityCheck>
            
            {/* Sử dụng roles */}
            <AuthorityCheck roles={['admin']}>
                <NavItem>Admin Panel</NavItem>
            </AuthorityCheck>
            
            {/* Kết hợp permission và role */}
            <AuthorityCheck 
                permissions={['transactions.approve']} 
                roles={['admin']}
            >
                <NavItem>Transaction Approval</NavItem>
            </AuthorityCheck>
            
            {/* Fallback cho hệ thống cũ */}
            <AuthorityCheck authority={[ADMIN]}>
                <NavItem>Old System</NavItem>
            </AuthorityCheck>
        </nav>
    )
}
```

## Cách sử dụng trong thực tế

### 1. Bảo vệ Page
```jsx
// pages/user-management.jsx
import { withResourcePermission } from '@/utils/withPermissionCheck'

function UserManagementPage() {
    return (
        <div>
            <h1>User Management</h1>
            <UserList />
        </div>
    )
}

export default withResourcePermission(UserManagementPage, 'users', 'view')
```

### 2. Conditional Rendering trong Component
```jsx
// components/UserActions.jsx
import { useResourcePermissions } from '@/utils/hooks/usePermission'

function UserActions({ user }) {
    const permissions = useResourcePermissions('users')
    
    return (
        <div>
            {permissions.edit && (
                <button onClick={() => editUser(user)}>Edit</button>
            )}
            {permissions.delete && (
                <button onClick={() => deleteUser(user)}>Delete</button>
            )}
        </div>
    )
}
```

### 3. Navigation Menu
```jsx
// components/Sidebar.jsx
import { PermissionCheck } from '@/components/shared/PermissionCheck'

function Sidebar() {
    return (
        <nav>
            <PermissionCheck permission="users.view">
                <NavLink href="/users">User Management</NavLink>
            </PermissionCheck>
            
            <PermissionCheck permission="transactions.view">
                <NavLink href="/transactions">Transactions</NavLink>
            </PermissionCheck>
            
            <PermissionCheck role="admin">
                <NavLink href="/admin">Admin Panel</NavLink>
            </PermissionCheck>
        </nav>
    )
}
```

## Permissions List

### User Management
- `users.view` - Xem danh sách users
- `users.create` - Tạo user mới
- `users.edit` - Chỉnh sửa user
- `users.delete` - Xóa user
- `users.assign-roles` - Gán role cho user
- `users.bulk-operations` - Thao tác hàng loạt

### Transaction Management
- `transactions.view` - Xem tất cả giao dịch
- `transactions.view-own` - Xem giao dịch của mình
- `transactions.approve` - Duyệt giao dịch
- `transactions.reject` - Từ chối giao dịch
- `transactions.deposit` - Nạp tiền
- `transactions.withdrawal` - Rút tiền

### Content Management
- `content-groups.view` - Xem nhóm nội dung
- `content-groups.create` - Tạo nhóm nội dung
- `content-groups.edit` - Chỉnh sửa nhóm nội dung
- `content-groups.delete` - Xóa nhóm nội dung
- `contents.view` - Xem nội dung
- `contents.create` - Tạo nội dung
- `contents.edit` - Chỉnh sửa nội dung
- `contents.delete` - Xóa nội dung

### TikTok Account Management
- `tiktok-accounts.view` - Xem tài khoản TikTok
- `tiktok-accounts.create` - Tạo tài khoản TikTok
- `tiktok-accounts.edit` - Chỉnh sửa tài khoản
- `tiktok-accounts.delete` - Xóa tài khoản
- `tiktok-accounts.import` - Import tài khoản

## Best Practices

1. **Sử dụng HOCs cho page-level protection**
2. **Sử dụng hooks cho component-level logic**
3. **Sử dụng PermissionCheck cho conditional rendering**
4. **Luôn có fallback UI cho trường hợp không có quyền**
5. **Test permissions với nhiều roles khác nhau**
6. **Cập nhật routePermissions.js khi thêm routes mới**

## Troubleshooting

### Lỗi thường gặp:

1. **Permission không hoạt động**
   - Kiểm tra user đã đăng nhập chưa
   - Kiểm tra permissions đã được fetch từ API chưa
   - Kiểm tra tên permission có đúng không

2. **Route redirect liên tục**
   - Kiểm tra routePermissions.js
   - Kiểm tra middleware configuration
   - Kiểm tra session data

3. **Menu không hiển thị**
   - Kiểm tra navigation config
   - Kiểm tra AuthorityCheck component
   - Kiểm tra permissions trong session

import { CONCEPTS_PREFIX_PATH } from '@/constants/route.constant'
import {
    NAV_ITEM_TYPE_TITLE,
    NAV_ITEM_TYPE_ITEM,
} from '@/constants/navigation.constant'
import { ADMIN } from '@/constants/roles.constant'

const managementNavigationConfig = [
    {
        key: 'management',
        path: '',
        title: 'Management',
        translateKey: 'nav.management',
        icon: 'management',
        type: NAV_ITEM_TYPE_TITLE,
        authority: [ADMIN],
        meta: {
            horizontalMenu: {
                layout: 'columns',
                columns: 3,
            },
        },
        subMenu: [
            {
                key: 'management.userManagement',
                path: `${CONCEPTS_PREFIX_PATH}/user-management`,
                title: 'User Management',
                translateKey: 'nav.managementUserManagement.userManagement',
                icon: 'userManagement',
                type: NAV_ITEM_TYPE_ITEM,
                authority: [ADMIN],
                permissions: ['users.view'],
                meta: {
                    description: {
                        translateKey: 'nav.managementUserManagement.userManagementDesc',
                        label: 'Manage users and permissions',
                    },
                },
                subMenu: [],
            },
            {
                key: 'management.permissionManagement',
                path: `${CONCEPTS_PREFIX_PATH}/permission-management`,
                title: 'Permission Management',
                translateKey: 'nav.managementPermissionManagement.permissionManagement',
                icon: 'permission',
                type: NAV_ITEM_TYPE_ITEM,
                authority: [ADMIN],
                permissions: ['permissions.view'],
                meta: {
                    description: {
                        translateKey: 'nav.managementPermissionManagement.permissionManagementDesc',
                        label: 'Manage permissions',
                    },
                },
                subMenu: [],
            },
            {
                key: 'management.roleManagement',
                path: `${CONCEPTS_PREFIX_PATH}/role-management`,
                title: 'Role Management',
                translateKey: 'nav.managementRoleManagement.roleManagement',
                icon: 'accountRoleAndPermission',
                type: NAV_ITEM_TYPE_ITEM,
                authority: [ADMIN],
                permissions: ['roles.view'],
                meta: {
                    description: {
                        translateKey: 'nav.managementRoleManagement.roleManagementDesc',
                        label: 'Manage roles and permissions',
                    },
                },
                subMenu: [],
            },
        ],
    },
]

export default managementNavigationConfig

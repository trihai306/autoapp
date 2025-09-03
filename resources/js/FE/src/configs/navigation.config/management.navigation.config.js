import { CONCEPTS_PREFIX_PATH } from '@/constants/route.constant'
import {
    NAV_ITEM_TYPE_TITLE,
    NAV_ITEM_TYPE_ITEM,
} from '@/constants/navigation.constant'
import { ADMIN, USER } from '@/constants/roles.constant'

const managementNavigationConfig = [
    {
        key: 'management',
        path: '',
        title: 'Management',
        translateKey: 'nav.management.management',
        icon: 'management',
        type: NAV_ITEM_TYPE_TITLE,
        authority: [ADMIN, USER],
        meta: {
            horizontalMenu: {
                layout: 'columns',
                columns: 3,
            },
        },
        subMenu: [
            {
                key: 'management.proxyManagement',
                path: `${CONCEPTS_PREFIX_PATH}/proxy-management`,
                title: 'Proxy Management',
                translateKey: 'nav.conceptsProxyManagement.proxyManagement',
                icon: 'connection',
                type: NAV_ITEM_TYPE_ITEM,
                authority: [ADMIN, USER],
                meta: {
                    description: {
                        translateKey: 'nav.conceptsProxyManagement.proxyManagementDesc',
                        label: 'Manage proxy servers',
                    },
                },
                subMenu: [],
            },
            {
                key: 'management.transactionManagement',
                path: `${CONCEPTS_PREFIX_PATH}/transaction-management`,
                title: 'Transaction Management',
                translateKey: 'nav.conceptsTransactionManagement.transactionManagement',
                icon: 'accountActivityLogs',
                type: NAV_ITEM_TYPE_ITEM,
                authority: [ADMIN, USER],
                meta: {
                    description: {
                        translateKey: 'nav.conceptsTransactionManagement.transactionManagementDesc',
                        label: 'Manage all transactions',
                    },
                },
                subMenu: [],
            },
            {
                key: 'management.userManagement',
                path: `${CONCEPTS_PREFIX_PATH}/user-management`,
                title: 'User Management',
                translateKey: 'nav.management.managementUserManagement.userManagement',
                icon: 'userManagement',
                type: NAV_ITEM_TYPE_ITEM,
                authority: [ADMIN],
                permissions: ['users.view'],
                meta: {
                    description: {
                        translateKey: 'nav.management.managementUserManagement.userManagementDesc',
                        label: 'Manage users and permissions',
                    },
                },
                subMenu: [],
            },
            {
                key: 'management.permissionManagement',
                path: `${CONCEPTS_PREFIX_PATH}/permission-management`,
                title: 'Permission Management',
                translateKey: 'nav.management.managementPermissionManagement.permissionManagement',
                icon: 'permission',
                type: NAV_ITEM_TYPE_ITEM,
                authority: [ADMIN],
                permissions: ['permissions.view'],
                meta: {
                    description: {
                        translateKey: 'nav.management.managementPermissionManagement.permissionManagementDesc',
                        label: 'Manage permissions',
                    },
                },
                subMenu: [],
            },
            {
                key: 'management.roleManagement',
                path: `${CONCEPTS_PREFIX_PATH}/role-management`,
                title: 'Role Management',
                translateKey: 'nav.management.managementRoleManagement.roleManagement',
                icon: 'accountRoleAndPermission',
                type: NAV_ITEM_TYPE_ITEM,
                authority: [ADMIN],
                permissions: ['roles.view'],
                meta: {
                    description: {
                        translateKey: 'nav.management.managementRoleManagement.roleManagementDesc',
                        label: 'Manage roles and permissions',
                    },
                },
                subMenu: [],
            },
            {
                key: 'management.servicePackageManagement',
                path: `${CONCEPTS_PREFIX_PATH}/service-package-management`,
                title: 'Service Package Management',
                translateKey: 'nav.management.managementServicePackageManagement.servicePackageManagement',
                icon: 'products',
                type: NAV_ITEM_TYPE_ITEM,
                authority: [ADMIN],
                permissions: ['service-packages.view'],
                meta: {
                    description: {
                        translateKey: 'nav.management.managementServicePackageManagement.servicePackageManagementDesc',
                        label: 'Manage service packages and features',
                    },
                },
                subMenu: [],
            },
            {
                key: 'management.servicePackageFeatures',
                path: `${CONCEPTS_PREFIX_PATH}/service-package-features`,
                title: 'Service Package Features',
                translateKey: 'nav.management.managementServicePackageFeatures.servicePackageFeatures',
                icon: 'uiDataDisplayTag',
                type: NAV_ITEM_TYPE_ITEM,
                authority: [ADMIN],
                permissions: ['service-package-features.view'],
                meta: {
                    description: {
                        translateKey: 'nav.management.managementServicePackageFeatures.servicePackageFeaturesDesc',
                        label: 'Manage features for service packages',
                    },
                },
                subMenu: [],
            },
        ],
    },
]

export default managementNavigationConfig

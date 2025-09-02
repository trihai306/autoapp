import { CONCEPTS_PREFIX_PATH } from '@/constants/route.constant'
import {
    NAV_ITEM_TYPE_TITLE,
    NAV_ITEM_TYPE_ITEM,
} from '@/constants/navigation.constant'
import { ADMIN, USER } from '@/constants/roles.constant'

const conceptsNavigationConfig = [
    // Nhóm: Bảng điều khiển
    {
        key: 'dashboardGroup',
        path: '',
        title: 'Bảng điều khiển',
        translateKey: 'nav.dashboardGroup',
        icon: 'concepts',
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
                key: 'concepts.deviceManagement',
                path: `${CONCEPTS_PREFIX_PATH}/device-management`,
                title: 'Quản lý thiết bị',
                translateKey: 'nav.conceptsDeviceManagement.deviceManagement',
                icon: 'deviceManagement',
                type: NAV_ITEM_TYPE_ITEM,
                authority: [ADMIN, USER],
                meta: {},
                subMenu: [],
            },
            {
                key: 'concepts.topup',
                path: `${CONCEPTS_PREFIX_PATH}/topup`,
                title: 'Nạp tiền',
                translateKey: 'nav.topup',
                icon: 'accountActivityLogs',
                type: NAV_ITEM_TYPE_ITEM,
                authority: [ADMIN, USER],
                meta: {},
                subMenu: [],
            },
            {
                key: 'concepts.serviceRegistration',
                path: `${CONCEPTS_PREFIX_PATH}/service-registration`,
                title: 'Đăng ký dịch vụ',
                translateKey: 'nav.conceptsServiceRegistration',
                icon: 'task',
                type: NAV_ITEM_TYPE_ITEM,
                authority: [ADMIN, USER],
                meta: {},
                subMenu: [],
            },
        ],
    },

    // Nhóm: Quản lý tài nguyên
    {
        key: 'resourceManagementGroup',
        path: '',
        title: 'Quản lý tài nguyên',
        translateKey: 'nav.resourceManagementGroup',
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
                key: 'concepts.contentManagement',
                path: `${CONCEPTS_PREFIX_PATH}/content-management`,
                title: 'Nội dung comment',
                translateKey: 'nav.conceptsContentManagement.contentManagement',
                icon: 'fileManager',
                type: NAV_ITEM_TYPE_ITEM,
                authority: [ADMIN, USER],
                meta: {},
                subMenu: [],
            },
            {
                key: 'concepts.tiktokAccountManagement',
                path: `${CONCEPTS_PREFIX_PATH}/tiktok-account-management`,
                title: 'Tài khoản TikTok',
                translateKey: 'nav.conceptsTiktokAccountManagement.tiktokAccountManagement',
                icon: 'userManagement',
                type: NAV_ITEM_TYPE_ITEM,
                authority: [ADMIN, USER],
                meta: {},
                subMenu: [],
            },
            {
                key: 'concepts.facebookAccountManagement',
                path: `${CONCEPTS_PREFIX_PATH}/facebook-account-management`,
                title: 'Tài khoản Facebook',
                translateKey: 'nav.conceptsFacebookAccountManagement.facebookAccountManagement',
                icon: 'userManagement',
                type: NAV_ITEM_TYPE_ITEM,
                authority: [ADMIN, USER],
                meta: {},
                subMenu: [],
            },
        ],
    },
]

export default conceptsNavigationConfig

import { CONCEPTS_PREFIX_PATH } from '@/constants/route.constant'
import {
    NAV_ITEM_TYPE_TITLE,
    NAV_ITEM_TYPE_COLLAPSE,
    NAV_ITEM_TYPE_ITEM,
} from '@/constants/navigation.constant'
import { ADMIN, USER } from '@/constants/roles.constant'

const conceptsNavigationConfig = [
    {
        key: 'concepts',
        path: '',
        title: 'Concepts',
        translateKey: 'nav.concepts',
        icon: 'concepts',
        type: NAV_ITEM_TYPE_TITLE,
        authority: [ADMIN, USER],
        meta: {
            horizontalMenu: {
                layout: 'columns',
                columns: 4,
            },
        },
        subMenu: [
            {
                key: 'concepts.transactionManagement',
                path: `${CONCEPTS_PREFIX_PATH}/transaction-management`,
                title: 'Transaction Management',
                translateKey: 'nav.conceptsTransactionManagement.transactionManagement',
                icon: 'accountActivityLogs',
                type: NAV_ITEM_TYPE_ITEM,
                authority: [ADMIN],
                permissions: ['transactions.view'],
                meta: {
                    description: {
                        translateKey: 'nav.conceptsTransactionManagement.transactionManagementDesc',
                        label: 'Manage all transactions',
                    },
                },
                subMenu: [],
            },
            {
                key: 'concepts.accountTaskManagement',
                path: `${CONCEPTS_PREFIX_PATH}/account-task-management`,
                title: 'Account Task Management',
                translateKey: 'nav.conceptsAccountTaskManagement.accountTaskManagement',
                icon: 'task',
                type: NAV_ITEM_TYPE_ITEM,
                authority: [ADMIN],
                permissions: ['account-tasks.view'],
                meta: {
                    description: {
                        translateKey: 'nav.conceptsAccountTaskManagement.accountTaskManagementDesc',
                        label: 'Manage all account tasks',
                    },
                },
                subMenu: [],
            },
            {
                key: 'concepts.tiktokAccountManagement',
                path: `${CONCEPTS_PREFIX_PATH}/tiktok-account-management`,
                title: 'TikTok Account Management',
                translateKey: 'nav.conceptsTiktokAccountManagement.tiktokAccountManagement',
                icon: 'userManagement',
                type: NAV_ITEM_TYPE_ITEM,
                authority: [ADMIN],
                permissions: ['tiktok-accounts.view'],
                meta: {
                    description: {
                        translateKey: 'nav.conceptsTiktokAccountManagement.tiktokAccountManagementDesc',
                        label: 'Manage TikTok accounts',
                    },
                },
                subMenu: [],
            },
            {
                key: 'concepts.deviceManagement',
                path: `${CONCEPTS_PREFIX_PATH}/device-management`,
                title: 'Device Management',
                translateKey: 'nav.conceptsDeviceManagement.deviceManagement',
                icon: 'deviceManagement',
                type: NAV_ITEM_TYPE_ITEM,
                authority: [ADMIN, USER],
                permissions: ['devices.view'],
                meta: {
                    description: {
                        translateKey: 'nav.conceptsDeviceManagement.deviceManagementDesc',
                        label: 'Manage devices and monitor status',
                    },
                },
                subMenu: [],
            },
            {
                key: 'concepts.contentManagement',
                path: `${CONCEPTS_PREFIX_PATH}/content-management`,
                title: 'Content Management',
                translateKey: 'nav.conceptsContentManagement.contentManagement',
                icon: 'fileManager',
                type: NAV_ITEM_TYPE_ITEM,
                authority: [ADMIN],
                permissions: ['content-groups.view', 'contents.view'],
                requireAll: false,
                meta: {
                    description: {
                        translateKey: 'nav.conceptsContentManagement.contentManagementDesc',
                        label: 'Manage content groups and contents',
                    },
                },
                subMenu: [],
            },
            {
                key: 'concepts.account',
                path: '',
                title: 'Account',
                translateKey: 'nav.conceptsAccount.account',
                icon: 'account',
                type: NAV_ITEM_TYPE_COLLAPSE,
                authority: [ADMIN, USER],
                meta: {
                    description: {
                        translateKey: 'nav.conceptsAccount.accountDesc',
                        label: 'Account settings and info',
                    },
                },
                subMenu: [
                    {
                        key: 'concepts.account.settings',
                        path: `${CONCEPTS_PREFIX_PATH}/account/settings`,
                        title: 'Settings',
                        translateKey: 'nav.conceptsAccount.settings',
                        icon: 'accountSettings',
                        type: NAV_ITEM_TYPE_ITEM,
                        authority: [ADMIN, USER],
                        meta: {
                            description: {
                                translateKey:
                                    'nav.conceptsAccount.settingsDesc',
                                label: 'Configure your settings',
                            },
                        },
                        subMenu: [],
                    },

                ],
            },
            // {
            //     key: 'concepts.helpCenter',
            //     path: '',
            //     title: 'Help Center',
            //     translateKey: 'nav.conceptsHelpCenter.helpCenter',
            //     icon: 'helpCenter',
            //     type: NAV_ITEM_TYPE_COLLAPSE,
            //     authority: [ADMIN, USER],
            //     meta: {
            //         description: {
            //             translateKey: 'nav.conceptsHelpCenter.helpCenterDesc',
            //             label: 'Support and articles',
            //         },
            //     },
            //     subMenu: [
            //         {
            //             key: 'concepts.helpCenter.supportHub',
            //             path: `${CONCEPTS_PREFIX_PATH}/help-center/support-hub`,
            //             title: 'Support Hub',
            //             translateKey: 'nav.conceptsHelpCenter.supportHub',
            //             icon: 'helpCeterSupportHub',
            //             type: NAV_ITEM_TYPE_ITEM,
            //             authority: [ADMIN, USER],
            //             meta: {
            //                 description: {
            //                     translateKey:
            //                         'nav.conceptsHelpCenter.supportHubDesc',
            //                     label: 'Central support hub',
            //                 },
            //             },
            //             subMenu: [],
            //         },
            //         {
            //             key: 'concepts.helpCenter.article',
            //             path: `${CONCEPTS_PREFIX_PATH}/help-center/article/pWBKE_0UiQ`,
            //             title: 'Article',
            //             translateKey: 'nav.conceptsHelpCenter.article',
            //             icon: 'helpCeterArticle',
            //             type: NAV_ITEM_TYPE_ITEM,
            //             authority: [ADMIN, USER],
            //             meta: {
            //                 description: {
            //                     translateKey:
            //                         'nav.conceptsHelpCenter.articleDesc',
            //                     label: 'Read support articles',
            //                 },
            //             },
            //             subMenu: [],
            //         },
            //         {
            //             key: 'concepts.helpCenter.editArticle',
            //             path: `${CONCEPTS_PREFIX_PATH}/help-center/edit-article/pWBKE_0UiQ`,
            //             title: 'Edit Article',
            //             translateKey: 'nav.conceptsHelpCenter.editArticle',
            //             icon: 'helpCeterEditArticle',
            //             type: NAV_ITEM_TYPE_ITEM,
            //             authority: [ADMIN, USER],
            //             meta: {
            //                 description: {
            //                     translateKey:
            //                         'nav.conceptsHelpCenter.editArticleDesc',
            //                     label: 'Modify article content',
            //                 },
            //             },
            //             subMenu: [],
            //         },
            //         {
            //             key: 'concepts.helpCenter.manageArticle',
            //             path: `${CONCEPTS_PREFIX_PATH}/help-center/manage-article`,
            //             title: 'Manage Article',
            //             translateKey: 'nav.conceptsHelpCenter.manageArticle',
            //             icon: 'helpCeterManageArticle',
            //             type: NAV_ITEM_TYPE_ITEM,
            //             authority: [ADMIN, USER],
            //             meta: {
            //                 description: {
            //                     translateKey:
            //                         'nav.conceptsHelpCenter.manageArticleDesc',
            //                     label: 'Article management',
            //                 },
            //             },
            //             subMenu: [],
            //         },
            //     ],
            // },
            {
                key: 'concepts.calendar',
                path: `${CONCEPTS_PREFIX_PATH}/calendar`,
                title: 'Calendar',
                translateKey: 'nav.calendar',
                icon: 'calendar',
                type: NAV_ITEM_TYPE_ITEM,
                authority: [ADMIN, USER],
                meta: {
                    description: {
                        translateKey: 'nav.calendarDesc',
                        label: 'Schedule and events',
                    },
                },
                subMenu: [],
            },
            {
                key: 'concepts.fileManager',
                path: `${CONCEPTS_PREFIX_PATH}/file-manager`,
                title: 'File Manager',
                translateKey: 'nav.fileManager',
                icon: 'fileManager',
                type: NAV_ITEM_TYPE_ITEM,
                authority: [ADMIN, USER],
                meta: {
                    description: {
                        translateKey: 'nav.fileManagerDesc',
                        label: 'Manage your files',
                    },
                },
                subMenu: [],
            },
            // {
            //     key: 'concepts.mail',
            //     path: `${CONCEPTS_PREFIX_PATH}/mail`,
            //     title: 'Mail',
            //     translateKey: 'nav.mail',
            //     icon: 'mail',
            //     type: NAV_ITEM_TYPE_ITEM,
            //     authority: [ADMIN, USER],
            //     meta: {
            //         description: {
            //             translateKey: 'nav.mailDesc',
            //             label: 'Manage your emails',
            //         },
            //     },
            //     subMenu: [],
            // },
            // {
            //     key: 'concepts.chat',
            //     path: `${CONCEPTS_PREFIX_PATH}/chat`,
            //     title: 'Chat',
            //     translateKey: 'nav.chat',
            //     icon: 'chat',
            //     type: NAV_ITEM_TYPE_ITEM,
            //     authority: [ADMIN, USER],
            //     meta: {
            //         description: {
            //             translateKey: 'nav.chatDesc',
            //             label: 'Chat with friends',
            //         },
            //     },
            //     subMenu: [],
            // },
        ],
    },
]

export default conceptsNavigationConfig

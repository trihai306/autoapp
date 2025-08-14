
import { ADMIN, USER } from '@/constants/roles.constant'
import { LAYOUT_TOP_BAR_CLASSIC } from '@/constants/theme.constant'

const conceptsRoute = {
    '/concepts/ai/chat': {
        key: 'concepts.ai.chat',
        authority: [ADMIN, USER],
        meta: {
            pageContainerType: 'contained',
        },
    },
    '/concepts/ai/image': {
        key: 'concepts.ai.image',
        authority: [ADMIN, USER],
        meta: {
            pageContainerType: 'contained',
            pageBackgroundType: 'plain',
        },
    },
    '/concepts/projects/scrum-board': {
        key: 'concepts.projects.scrumBoard',
        authority: [ADMIN, USER],
        meta: {
            pageContainerType: 'contained',
        },
    },
    '/concepts/projects/project-list': {
        key: 'concepts.projects.projectList',
        authority: [ADMIN, USER],
        meta: {
            pageContainerType: 'contained',
            pageBackgroundType: 'plain',
        },
    },
    '/concepts/projects/tasks': {
        key: 'concepts.projects.projectTasks',
        authority: [ADMIN, USER],
        meta: {
            pageContainerType: 'contained',
        },
    },
    '/concepts/projects/project-details/[slug]': {
        key: 'concepts.projects.projectDetails',
        authority: [ADMIN, USER],
        meta: {
            pageContainerType: 'contained',
            pageBackgroundType: 'plain',
        },
        dynamicRoute: true,
    },
    '/concepts/projects/tasks/[slug]': {
        key: 'concepts.projects.projectIssue',
        authority: [ADMIN, USER],
        meta: {
            pageContainerType: 'contained',
        },
        dynamicRoute: true,
    },
    '/concepts/customers/customer-list': {
        key: 'concepts.customers.customerList',
        authority: [ADMIN, USER],
    },
    '/concepts/customers/customer-edit/[slug]': {
        key: 'concepts.customers.customerEdit',
        authority: [ADMIN, USER],
        meta: {
            header: {
                title: 'Edit customer',
                description:
                    'Manage customer details, purchase history, and preferences.',
                contained: true,
            },
            footer: false,
        },
        dynamicRoute: true,
    },
    '/concepts/customers/customer-create': {
        key: 'concepts.customers.customerCreate',
        authority: [ADMIN, USER],
        meta: {
            header: {
                title: 'Create customer',
                description:
                    'Manage customer details, track purchases, and update preferences easily.',
                contained: true,
            },
            footer: false,
        },
    },
    '/concepts/customers/customer-details/[slug]': {
        key: 'concepts.customers.customerDetails',
        authority: [ADMIN, USER],
        meta: {
            pageContainerType: 'contained',
        },
        dynamicRoute: true,
    },
    '/concepts/user-management': {
        key: 'concepts.userManagement.userManagement',
        authority: [ADMIN],
        meta: {
            pageContainerType: 'contained',
        },
    },
    '/concepts/account/settings': {
        key: 'concepts.account.settings',
        authority: [ADMIN, USER],
        meta: {
            // layout: LAYOUT_TOP_BAR_CLASSIC,
            header: {
                title: 'Settings',
            },
            pageContainerType: 'contained',
        },
    },
    '/concepts/account/activity-log': {
        key: 'concepts.account.activityLog',
        authority: [ADMIN, USER],
        meta: {
            pageContainerType: 'contained',
        },
    },
    '/concepts/account/pricing': {
        key: 'concepts.account.pricing',
        authority: [ADMIN, USER],
        meta: {
            pageContainerType: 'contained',
        },
    },
    '/concepts/account/roles-permissions': {
        key: 'concepts.account.rolesPermissions',
        authority: [ADMIN, USER],
        meta: {
            pageContainerType: 'contained',
            pageBackgroundType: 'plain',
        },
    },
    '/concepts/help-center/support-hub': {
        key: 'concepts.helpCenter.supportHub',
        authority: [ADMIN, USER],
        meta: {
            pageContainerType: 'gutterless',
            pageBackgroundType: 'plain',
        },
    },
    '/concepts/help-center/article/[slug]': {
        key: 'concepts.helpCenter.article',
        authority: [ADMIN, USER],
        dynamicRoute: true,
        meta: {
            pageContainerType: 'contained',
            pageBackgroundType: 'plain',
        },
    },
    '/concepts/help-center/edit-article/[slug]': {
        key: 'concepts.helpCenter.editArticle',
        authority: [ADMIN, USER],
        dynamicRoute: true,
        meta: {
            pageBackgroundType: 'plain',
            footer: false,
        },
    },
    '/concepts/help-center/manage-article': {
        key: 'concepts.helpCenter.manageArticle',
        authority: [ADMIN, USER],
        meta: {
            pageBackgroundType: 'plain',
            footer: false,
        },
    },
    '/concepts/file-manager': {
        key: 'concepts.fileManager',
        authority: [ADMIN, USER],
        meta: {
            pageContainerType: 'contained',
            pageBackgroundType: 'plain',
        },
    },
    '/concepts/calendar': {
        key: 'concepts.calendar',
        authority: [ADMIN, USER],
        meta: {
            pageContainerType: 'contained',
            pageBackgroundType: 'plain',
        },
    },
    '/concepts/mail': {
        key: 'concepts.mail',
        authority: [ADMIN, USER],
        meta: {
            pageContainerType: 'contained',
        },
    },
    '/concepts/chat': {
        key: 'concepts.chat',
        authority: [ADMIN, USER],
        meta: {
            pageContainerType: 'contained',
        },
    },
}

export default conceptsRoute

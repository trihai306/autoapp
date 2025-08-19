import { ADMIN, USER } from '@/constants/roles.constant'

const proxyManagementRoute = {
    '/concepts/proxy-management': {
        key: 'concepts.proxyManagement',
        authority: [ADMIN, USER],
        meta: {
            pageContainerType: 'contained',
        },
    },
}

export default proxyManagementRoute

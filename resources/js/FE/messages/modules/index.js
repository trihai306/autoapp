// Messages Modules Index
// File này export tất cả messages modules để dễ quản lý

export const messagesModules = {
    'tiktok-account-management': {
        en: () => import('./tiktok-account-management/en.json'),
        vi: () => import('./tiktok-account-management/vi.json'),
        ar: () => import('./tiktok-account-management/ar.json'),
        es: () => import('./tiktok-account-management/es.json'),
        zh: () => import('./tiktok-account-management/zh.json'),
    },
    'account': {
        en: () => import('./account/en.json'),
        vi: () => import('./account/vi.json'),
        ar: () => import('./account/ar.json'),
        es: () => import('./account/es.json'),
        zh: () => import('./account/zh.json'),
    },
    'account-task-management': {
        en: () => import('./account-task-management/en.json'),
        vi: () => import('./account-task-management/vi.json'),
        ar: () => import('./account-task-management/ar.json'),
        es: () => import('./account-task-management/es.json'),
        zh: () => import('./account-task-management/zh.json'),
    },
    'auth': {
        en: () => import('./auth/en.json'),
        vi: () => import('./auth/vi.json'),
        ar: () => import('./auth/ar.json'),
        es: () => import('./auth/es.json'),
        zh: () => import('./auth/zh.json'),
    },
    'role-management': {
        en: () => import('./role-management/en.json'),
        vi: () => import('./role-management/vi.json'),
        ar: () => import('./role-management/ar.json'),
        es: () => import('./role-management/es.json'),
        zh: () => import('./role-management/zh.json'),
    },
    'permission-management': {
        en: () => import('./permission-management/en.json'),
        vi: () => import('./permission-management/vi.json'),
        ar: () => import('./permission-management/ar.json'),
        es: () => import('./permission-management/es.json'),
        zh: () => import('./permission-management/zh.json'),
    },
    'transaction-management': {
        en: () => import('./transaction-management/en.json'),
        vi: () => import('./transaction-management/vi.json'),
        ar: () => import('./transaction-management/ar.json'),
        es: () => import('./transaction-management/es.json'),
        zh: () => import('./transaction-management/zh.json'),
    },
    'user-management': {
        en: () => import('./user-management/en.json'),
        vi: () => import('./user-management/vi.json'),
        ar: () => import('./user-management/ar.json'),
        es: () => import('./user-management/es.json'),
        zh: () => import('./user-management/zh.json'),
    },
}

// Helper function để lấy messages cho module và ngôn ngữ cụ thể
export const getModuleMessages = async (moduleName, locale) => {
    try {
        const module = messagesModules[moduleName]
        if (!module) {
            console.warn(`Module ${moduleName} not found in messages modules`)
            return {}
        }
        
        const messages = await module[locale]?.()
        return messages?.default || {}
    } catch (error) {
        console.error(`Error loading messages for module ${moduleName} and locale ${locale}:`, error)
        return {}
    }
}

// Helper function để merge messages
export const mergeMessages = (mainMessages, moduleMessages) => {
    return {
        ...mainMessages,
        ...moduleMessages,
    }
} 
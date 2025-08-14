import { getRequestConfig } from 'next-intl/server'
import { getLocale } from '@/server/actions/system/locale'

export default getRequestConfig(async () => {
    const locale = await getLocale()
    
    try {
        // Load main messages
        const mainMessages = (await import(`../messages/${locale}.json`)).default
        
        // Load module messages
        const moduleMessages = await loadModuleMessages(locale)
        
        // Merge all messages
        const messages = {
            ...mainMessages,
            ...moduleMessages
        }
        
        return {
            locale,
            messages,
            timeZone: 'Asia/Ho_Chi_Minh'
        }
    } catch (error) {
        console.error(`Failed to load messages for locale ${locale}:`, error)
        
        // Fallback to English
        const fallbackLocale = 'en'
        const mainMessages = (await import(`../messages/${fallbackLocale}.json`)).default
        const moduleMessages = await loadModuleMessages(fallbackLocale)
        
        const messages = {
            ...mainMessages,
            ...moduleMessages
        }
        
        return {
            locale: fallbackLocale,
            messages,
            timeZone: 'Asia/Ho_Chi_Minh'
        }
    }
})

async function loadModuleMessages(locale) {
    try {
        const authMessages = (await import(`../messages/modules/auth/${locale}.json`)).default
        const permissionManagementMessages = (await import(`../messages/modules/permission-management/${locale}.json`)).default
        const roleManagementMessages = (await import(`../messages/modules/role-management/${locale}.json`)).default
        const transactionManagementMessages = (await import(`../messages/modules/transaction-management/${locale}.json`)).default
        const userManagementMessages = (await import(`../messages/modules/user-management/${locale}.json`)).default
        const accountMessages = (await import(`../messages/modules/account/${locale}.json`)).default
        const accountTaskManagementMessages = (await import(`../messages/modules/account-task-management/${locale}.json`)).default
        const tiktokAccountManagementMessages = (await import(`../messages/modules/tiktok-account-management/${locale}.json`)).default

        return {
            ...authMessages,
            ...permissionManagementMessages,
            ...roleManagementMessages,
            ...transactionManagementMessages,
            ...userManagementMessages,
            ...accountMessages,
            ...accountTaskManagementMessages,
            ...tiktokAccountManagementMessages,
        }
    } catch (error) {
        console.warn(`Failed to load module messages for locale ${locale}:`, error.message)
        
        // Fallback to English
        const fallbackLocale = 'en'
        const authMessages = (await import(`../messages/modules/auth/${fallbackLocale}.json`)).default
        const permissionManagementMessages = (await import(`../messages/modules/permission-management/${fallbackLocale}.json`)).default
        const roleManagementMessages = (await import(`../messages/modules/role-management/${fallbackLocale}.json`)).default
        const transactionManagementMessages = (await import(`../messages/modules/transaction-management/${fallbackLocale}.json`)).default
        const userManagementMessages = (await import(`../messages/modules/user-management/${fallbackLocale}.json`)).default
        const accountMessages = (await import(`../messages/modules/account/${fallbackLocale}.json`)).default
        const accountTaskManagementMessages = (await import(`../messages/modules/account-task-management/${fallbackLocale}.json`)).default
        const tiktokAccountManagementMessages = (await import(`../messages/modules/tiktok-account-management/${fallbackLocale}.json`)).default

        return {
            ...authMessages,
            ...permissionManagementMessages,
            ...roleManagementMessages,
            ...transactionManagementMessages,
            ...userManagementMessages,
            ...accountMessages,
            ...accountTaskManagementMessages,
            ...tiktokAccountManagementMessages,
        }
    }
}

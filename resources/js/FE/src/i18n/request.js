import { getRequestConfig } from 'next-intl/server'
import { getLocale } from '@/server/actions/system/locale'

export default getRequestConfig(async () => {
    const locale = await getLocale()
    const mainMessages = (await import(`../../messages/${locale}.json`)).default
    
    // Import messages theo locale
    const loadModuleMessages = async (locale) => {
        try {
            const authMessages = (await import(`../../messages/modules/auth/${locale}.json`)).default
            const permissionManagementMessages = (await import(`../../messages/modules/permission-management/${locale}.json`)).default
            const roleManagementMessages = (await import(`../../messages/modules/role-management/${locale}.json`)).default
            const transactionManagementMessages = (await import(`../../messages/modules/transaction-management/${locale}.json`)).default
            const userManagementMessages = (await import(`../../messages/modules/user-management/${locale}.json`)).default
            const accountMessages = (await import(`../../messages/modules/account/${locale}.json`)).default
            const accountTaskManagementMessages = (await import(`../../messages/modules/account-task-management/${locale}.json`)).default
            const tiktokAccountManagementMessages = (await import(`../../messages/modules/tiktok-account-management/${locale}.json`)).default

            return {
                auth: authMessages,
                permissionManagement: permissionManagementMessages,
                roleManagement: roleManagementMessages,
                transactionManagement: transactionManagementMessages,
                userManagement: userManagementMessages,
                account: accountMessages,
                accountTaskManagement: accountTaskManagementMessages,
                tiktokAccountManagement: tiktokAccountManagementMessages,
            }
        } catch (error) {
            console.warn(`Failed to load messages for locale ${locale}:`, error.message)
            // Fallback to English
            const authMessages = (await import(`../../messages/modules/auth/en.json`)).default
            const permissionManagementMessages = (await import(`../../messages/modules/permission-management/en.json`)).default
            const roleManagementMessages = (await import(`../../messages/modules/role-management/en.json`)).default
            const transactionManagementMessages = (await import(`../../messages/modules/transaction-management/en.json`)).default
            const userManagementMessages = (await import(`../../messages/modules/user-management/en.json`)).default
            const accountMessages = (await import(`../../messages/modules/account/en.json`)).default
            const accountTaskManagementMessages = (await import(`../../messages/modules/account-task-management/en.json`)).default
            const tiktokAccountManagementMessages = (await import(`../../messages/modules/tiktok-account-management/en.json`)).default

            return {
                auth: authMessages,
                permissionManagement: permissionManagementMessages,
                roleManagement: roleManagementMessages,
                transactionManagement: transactionManagementMessages,
                userManagement: userManagementMessages,
                account: accountMessages,
                accountTaskManagement: accountTaskManagementMessages,
                tiktokAccountManagement: tiktokAccountManagementMessages,
            }
        }
    }

    const moduleMessages = await loadModuleMessages(locale)

    const messages = {
        ...mainMessages,
        // Merge messages theo cấu trúc của từng module
        ...moduleMessages.auth, // auth không có namespace
        ...moduleMessages.permissionManagement, // permission-management có namespace
        ...moduleMessages.roleManagement, // role-management có namespace
        ...moduleMessages.transactionManagement, // transaction-management có namespace
        ...moduleMessages.userManagement, // user-management có namespace
        ...moduleMessages.account, // account có namespace
        ...moduleMessages.accountTaskManagement, // account-task-management có namespace
        tiktokAccountManagement: moduleMessages.tiktokAccountManagement, // tiktok-account-management có namespace
    }

    return {
        locale,
        messages,
    }
})

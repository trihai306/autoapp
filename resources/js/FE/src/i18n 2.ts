import { getRequestConfig } from 'next-intl/server'
import { getLocale } from '@/server/actions/system/locale'

export default getRequestConfig(async () => {
    const locale = await getLocale()

    try {
        // Load main messages
        const mainMessages = (await import(`./messages/${locale}.json`)).default

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
        const mainMessages = (await import(`./messages/${fallbackLocale}.json`)).default
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
    const modules = [
        'auth',
        'permission-management',
        'role-management',
        'transaction-management',
        'user-management',
        'account',
        'account-task-management',
        'tiktok-account-management',
        'facebook-account-management',
    ]

    const aggregated = {}

    for (const moduleName of modules) {
        try {
            const mod = (await import(`./messages/modules/${moduleName}/${locale}.json`)).default
            Object.assign(aggregated, mod)
        } catch (err) {
            // Fallback to en for this module only
            try {
                const fallback = (await import(`./messages/modules/${moduleName}/en.json`)).default
                Object.assign(aggregated, fallback)
            } catch (err2) {
                console.warn(`Messages missing for module ${moduleName} (locale ${locale} and fallback en).`)
            }
        }
    }

    return aggregated
}

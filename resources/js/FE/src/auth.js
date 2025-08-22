import NextAuth from 'next-auth'
import appConfig from '@/configs/app.config'
import authConfig from '@/configs/auth.config'

// Fallback an toàn cho các đường dẫn để tránh undefined/null
const SAFE_SIGN_IN_PATH =
    typeof appConfig?.unAuthenticatedEntryPath === 'string' && appConfig.unAuthenticatedEntryPath.trim()
        ? appConfig.unAuthenticatedEntryPath
        : '/sign-in'

const SAFE_ERROR_PATH = SAFE_SIGN_IN_PATH

export const { handlers, signIn, signOut, auth } = NextAuth({
    secret: process.env.NEXTAUTH_SECRET || 'default-secret-key',
    pages: {
        signIn: SAFE_SIGN_IN_PATH,
        error: SAFE_ERROR_PATH,
    },
    session: {
        strategy: 'jwt',
        maxAge: 24 * 60 * 60, // 24 hours
    },
    debug: process.env.NODE_ENV === 'development',
    providers: authConfig.providers,
    callbacks: authConfig.callbacks,
    events: authConfig.events,
    logger: {
        error(code, ...message) {
            console.error('NextAuth Error:', code, ...message)
        },
        warn(code, ...message) {
            console.warn('NextAuth Warning:', code, ...message)
        },
        debug(code, ...message) {
            if (process.env.NODE_ENV === 'development') {
                console.log('NextAuth Debug:', code, ...message)
            }
        },
    },
})
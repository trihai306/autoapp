import NextAuth from 'next-auth'
import appConfig from '@/configs/app.config'
import authConfig from '@/configs/auth.config'

export const { handlers, signIn, signOut, auth } = NextAuth({
    secret: process.env.NEXTAUTH_SECRET || 'default-secret-key',
    pages: {
        signIn: appConfig.unAuthenticatedEntryPath,
        error: appConfig.unAuthenticatedEntryPath,
    },
    session: {
        strategy: 'jwt',
        maxAge: 24 * 60 * 60, // 24 hours
    },
    debug: process.env.NODE_ENV === 'development',
    providers: authConfig.providers,
    callbacks: authConfig.callbacks,
    events: authConfig.events,
    // Thêm cấu hình để xử lý lỗi tốt hơn
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
        }
    }
})
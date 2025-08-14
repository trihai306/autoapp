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
    ...authConfig,
})
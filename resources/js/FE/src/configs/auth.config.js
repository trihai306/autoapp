import validateCredential from '../server/actions/user/validateCredential'
import Credentials from 'next-auth/providers/credentials'

// eslint-disable-next-line import/no-anonymous-default-export
export default {
    providers: [
        Credentials({
            id: 'credentials',
            name: 'Credentials',
            credentials: {
                login: { label: "Email/Phone", type: "text" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials, req) {
                try {
                    if (!credentials?.login || !credentials?.password) {
                        return null
                    }

                    const user = await validateCredential(credentials)
                    return user || null

                } catch (error) {
                    return null
                }
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user, account }) {
            if (user && account) {
                // Initial sign-in - only store essential data
                token.id = user.id
                token.name = user.full_name || user.name
                token.email = user.email
                token.accessToken = user.token
                token.balance = user.balance || 0
                token.accessTokenExpires = Date.now() + 24 * 60 * 60 * 1000 // 24 hours
            }

            // Return previous token if it has not expired yet
            if (token.accessTokenExpires && Date.now() < token.accessTokenExpires) {
                return token
            }

            // Token expired
            return null
        },
        async session({ session, token }) {
            if (token) {
                session.user.id = token.id
                session.user.name = token.name
                session.user.email = token.email
                session.user.avatar = token.avatar
                session.accessToken = token.accessToken
                session.user.login_token = token.login_token
                session.user.first_name = token.first_name
                session.user.last_name = token.last_name
                session.user.roles = token.permissions?.roles || []
                session.user.permissions = token.permissions?.permissions || []
                session.user.permission_groups = token.permissions?.permission_groups || {}
                session.balance = token.balance || 0
            } else {
                console.log('❌ Session callback - No valid token')
            }
            return session
        },
    },
    // Thêm xử lý lỗi
    events: {
        async signIn({ user, account, profile, isNewUser }) {
            console.log('✅ User signed in successfully:', {
                userId: user.id,
                email: user.email,
                provider: account?.provider,
                balance: user.balance
            })
        },
        async signOut({ session, token }) {
            console.log('👋 User signed out:', {
                userId: token?.id,
                email: token?.email
            })
        },
        async error(error) {
            console.error('❌ NextAuth error event:', error)
        },
    },
}

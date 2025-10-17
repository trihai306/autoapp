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
                    console.log('🔐 NextAuth authorize called with:', {
                        login: credentials?.login,
                        hasPassword: !!credentials?.password
                    })

                    if (!credentials?.login || !credentials?.password) {
                        console.error('❌ Missing credentials')
                        return null
                    }

                    const user = await validateCredential(credentials)

                    if (user) {
                        console.log('✅ User authorized successfully:', {
                            id: user.id,
                            email: user.email,
                            balance: user.balance
                        })
                        return user
                    }

                    console.log('❌ User authorization failed')
                    return null

                } catch (error) {
                    console.error('❌ NextAuth authorize error:', error)

                    // Thay vì throw error, return null để NextAuth xử lý
                    // và trả về lỗi cụ thể cho client
                    return null
                }
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user, account }) {
            if (user && account) {
                // Initial sign-in
                console.log('🔄 JWT callback - Initial sign-in:', {
                    userId: user.id,
                    email: user.email,
                    balance: user.balance
                })

                token.id = user.id
                token.name = user.full_name || user.name
                token.email = user.email
                token.avatar = user.avatar
                token.accessToken = user.token
                token.first_name = user.first_name
                token.last_name = user.last_name
                token.roles = user.roles || []
                token.login_token = user.login_token
                token.balance = user.balance || 0
                token.permissions = user.permissions || {
                    roles: [],
                    permissions: [],
                    permission_groups: {}
                }
                token.accessTokenExpires = Date.now() + 24 * 60 * 60 * 1000 // 24 hours
            }

            // Return previous token if it has not expired yet
            if (token.accessTokenExpires && Date.now() < token.accessTokenExpires) {
                return token
            }

            // Token expired
            console.log('⏰ JWT token expired')
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

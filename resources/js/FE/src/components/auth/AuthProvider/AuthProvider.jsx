'use client'
import { useEffect, useState } from 'react'
import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react'
import SessionContext from './SessionContext'
import { apiGetProfile } from '@/services/auth/AuthService'

const AuthProvider = (props) => {
    const { session, children } = props

    const [currentSession, setCurrentSession] = useState(session)

    // Đồng bộ khi server session thay đổi (navigations, refresh)
    useEffect(() => {
        setCurrentSession(session)
    }, [session])

    // Hàm để refresh session từ API
    const refreshSession = async () => {
        if (!currentSession?.accessToken) return

        try {
            console.log('🔄 [DEBUG] Refreshing session from API...')
            const profile = await apiGetProfile()
            
            setCurrentSession((prev) => {
                if (!prev) return prev
                return {
                    ...prev,
                    user: {
                        ...prev.user,
                        // Ghép dữ liệu hồ sơ mới vào user hiện tại
                        ...profile,
                    },
                    balance: profile?.balance ?? prev.balance,
                }
            })
            console.log('✅ [DEBUG] Session refreshed successfully')
        } catch (error) {
            console.warn('Could not refresh user profile from API:', error)
        }
    }

    // Sau khi có accessToken, gọi Laravel API để lấy hồ sơ mới nhất
    useEffect(() => {
        if (!currentSession?.accessToken) return

        let isCancelled = false
        ;(async () => {
            try {
                const profile = await apiGetProfile()
                if (isCancelled) return

                setCurrentSession((prev) => {
                    if (!prev) return prev
                    return {
                        ...prev,
                        user: {
                            ...prev.user,
                            // Ghép dữ liệu hồ sơ mới vào user hiện tại
                            ...profile,
                        },
                        balance: profile?.balance ?? prev.balance,
                    }
                })
            } catch (error) {
                // Không chặn UI nếu profile fail, chỉ log cảnh báo
                console.warn('Could not refresh user profile from API:', error)
            }
        })()

        return () => {
            isCancelled = true
        }
    }, [currentSession?.accessToken])

    return (
        /** since the next auth useSession hook was triggering mutliple re-renders, hence we are using the our custom session provider and we still included the next auth session provider, incase we need to use any client hooks from next auth */
        <NextAuthSessionProvider session={currentSession} refetchOnWindowFocus={false}>
            <SessionContext.Provider value={{ ...currentSession, refreshSession }}>
                {children}
            </SessionContext.Provider>
        </NextAuthSessionProvider>
    )
}

export default AuthProvider

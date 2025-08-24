// resources/js/FE/src/app/(public-pages)/force-logout/page.jsx
'use client'

import { useEffect } from 'react'
import { signOut } from 'next-auth/react'
import appConfig from '@/configs/app.config'
import { useRouter } from 'next/navigation'
import { disconnectEcho } from '@/utils/echo'

const ForceLogoutPage = () => {
    const router = useRouter()
    
    useEffect(() => {
        const performCompleteLogout = async () => {
            try {
                // Clear all local storage and session storage
                if (typeof localStorage !== 'undefined') {
                    localStorage.clear()
                }
                if (typeof sessionStorage !== 'undefined') {
                    sessionStorage.clear()
                }
                
                // Clear any cookies that might contain user data
                if (typeof document !== 'undefined') {
                    // Clear all cookies by setting them to expire
                    document.cookie.split(";").forEach((c) => {
                        const eqPos = c.indexOf("=")
                        const name = eqPos > -1 ? c.substr(0, eqPos) : c
                        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/"
                        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=" + window.location.hostname
                    })
                }
                
                // Disconnect Echo trước khi logout
                if (typeof window !== 'undefined') {
                    disconnectEcho()
                }
                
                // Thực hiện signOut để xóa hết session NextAuth
                await signOut({ redirect: false })
                
                // Redirect về trang chủ thay vì sign-in page
                router.push('/')
            } catch (error) {
                console.error('Error during complete logout:', error)
                // Fallback: force redirect về trang chủ
                window.location.href = '/'
            }
        }
        
        performCompleteLogout()
    }, [router])

    // Hiển thị một thông báo loading trong khi chờ
    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <p>Your session has expired. Redirecting to home page...</p>
        </div>
    )
}

export default ForceLogoutPage

import appConfig from '@/configs/app.config'

const AxiosResponseIntrceptorErrorCallback = async (error) => {
    const status = error.response?.status

    // Debug: Log all error details
    // // console.log('AxiosResponseIntrceptorErrorCallback called:', {
    //     status,
    //     isClient: typeof window !== 'undefined',
    //     error: error.response
    // })

    // Only handle 401 on the client-side
    // On server-side, let withAuthCheck handle the 401 error
    if (typeof window !== 'undefined' && status === 401) {
        // // console.log('401 Unauthorized: Session expired or invalid - redirecting to sign-in')
        // // console.log('Current URL:', window.location.href)
        // // console.log('Redirect URL:', appConfig.unAuthenticatedEntryPath)
        
        try {
            // Dynamic import to ensure it works on client-side
            const { signOut } = await import('next-auth/react')
            
            // Force complete sign out and clear NextAuth session
            await signOut({ 
                redirect: false 
            })
            
            // Sử dụng Next.js router hoặc window.location.href nếu cần thiết
            // Lưu ý: Trong interceptor này, chúng ta không thể sử dụng useRouter hook
            // vì interceptor chạy bên ngoài React component context
            // nên vẫn cần dùng window.location.href hoặc redirect function
            if (typeof window !== 'undefined') {
                window.location.href = '/sign-in'
            }
        } catch (signOutError) {
            console.error('Error during signOut:', signOutError)
            // Fallback: sử dụng window.location.href
            if (typeof window !== 'undefined') {
                window.location.href = '/sign-in'
            }
        }
        
        // Still reject the promise so components can handle the error appropriately
        // This allows error boundaries and .catch() handlers to work properly
        return Promise.reject({
            ...error,
            isUnauthorized: true,
            message: 'Session expired or invalid'
        })
    }

    // For all other errors, or for errors on the server, reject the promise
    // so the calling function (.catch() or SWR's onError) can handle it.
    return Promise.reject(error)
}

export default AxiosResponseIntrceptorErrorCallback

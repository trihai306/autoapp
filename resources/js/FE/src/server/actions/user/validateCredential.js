'use server'
import { apiSignIn } from '@/services/auth/AuthService'
import appConfig from '@/configs/app.config'

const validateCredential = async (values) => {
    const { login, password } = values

    try {
        // console.log('🔍 validateCredential: Attempting login with axios')
        
        // Use apiSignIn which uses axios through ApiService
        const data = await apiSignIn({ login, password })
        
        // console.log('✅ Login API request successful with axios')

        if (data && data.user && data.token) {
            let userObject = data.user

            // Safely handle user data: parse if it's a string, use directly if it's an object.
            if (typeof userObject === 'string') {
                try {
                    userObject = JSON.parse(userObject)
                } catch (e) {
                    console.error('Failed to parse user data:', e)
                    return null
                }
            }

            // Fetch user permissions after successful login using axios
            try {
                const { apiGetProfile } = await import('@/services/auth/AuthService')
                
                // Create a temporary API call for permissions with the token
                const ApiService = await import('@/services/ApiService')
                const permissionsData = await ApiService.default.fetchData({
                    url: '/profile/permissions',
                    method: 'get',
                    headers: {
                        Authorization: `Bearer ${data.token}`,
                    },
                })

                if (permissionsData && permissionsData.permissions) {
                    userObject.permissions = permissionsData.permissions
                } else {
                    console.warn('Failed to fetch user permissions')
                    userObject.permissions = { roles: [], permissions: [], permission_groups: {} }
                }
            } catch (error) {
                console.error('Failed to fetch permissions:', error)
                userObject.permissions = { roles: [], permissions: [], permission_groups: {} }
            }

            return {
                ...userObject,
                token: data.token,
                login_token: data.login_token,
            }
        }
        return null
    } catch (error) {
        console.error('❌ Authentication request failed with axios:', {
            message: error.message,
            name: error.name,
            stack: error.stack,
        })
        return null
    }
}

export default validateCredential

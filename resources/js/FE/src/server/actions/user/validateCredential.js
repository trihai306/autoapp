'use server'
import { apiSignIn } from '@/services/auth/AuthService'
import appConfig from '@/configs/app.config'

const validateCredential = async (values) => {
    const { login, password } = values

    try {
        console.log('🔍 validateCredential: Attempting login with Laravel API', { 
            login,
            apiUrl: `${appConfig.API_BASE_URL}/api/login`  // Đúng endpoint với /api prefix
        })
        
        // Use apiSignIn which uses axios through ApiService
        const data = await apiSignIn({ login, password })
        
        console.log('✅ Laravel API login successful:', {
            hasUser: !!data?.user,
            hasToken: !!data?.token,
            hasLoginToken: !!data?.login_token
        })

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
                console.log('🔐 Fetching user permissions...')
                
                // Create a temporary API call for permissions with the token
                const ApiService = await import('@/services/ApiService')
                const permissionsData = await ApiService.default.fetchDataWithAxios({
                    url: '/api/profile/permissions',
                    method: 'get',
                    headers: {
                        Authorization: `Bearer ${data.token}`,
                        'Accept': 'application/json'
                    },
                })

                if (permissionsData && permissionsData.permissions) {
                    userObject.permissions = permissionsData.permissions
                    console.log('✅ User permissions fetched successfully')
                } else {
                    console.warn('⚠️ Failed to fetch user permissions, using defaults')
                    userObject.permissions = { roles: [], permissions: [], permission_groups: {} }
                }
            } catch (error) {
                console.error('❌ Failed to fetch permissions:', error)
                userObject.permissions = { roles: [], permissions: [], permission_groups: {} }
            }

            const finalUser = {
                ...userObject,
                token: data.token,
                login_token: data.login_token,
            }
            
            console.log('✅ Final user object prepared:', {
                id: finalUser.id,
                email: finalUser.email,
                hasPermissions: !!finalUser.permissions
            })
            
            return finalUser
        }
        
        // Nếu không có user hoặc token
        console.error('❌ Invalid API response - missing user or token')
        return null
        
    } catch (error) {
        console.error('❌ Authentication request failed:', {
            message: error.message,
            name: error.name,
            stack: error.stack,
        })
        
        // Xử lý các loại lỗi khác nhau
        if (error.response) {
            // Lỗi từ API response
            const status = error.response.status
            const errorData = error.response.data
            
            console.error('📡 API Error Response:', { 
                status, 
                errorData,
                fullError: JSON.stringify(errorData, null, 2)
            })
            
            // Kiểm tra xem response có phải JSON không
            if (typeof errorData === 'string' && errorData.includes('<html>')) {
                console.error('❌ Laravel returned HTML instead of JSON - check Accept header')
                return null
            }
            
            switch (status) {
                case 401:
                    // Xử lý validation errors từ Laravel
                    if (errorData?.message) {
                        console.error('❌ 401 Unauthorized:', errorData.message)
                    } else if (errorData?.errors) {
                        const validationErrors = Object.values(errorData.errors).flat()
                        console.error('❌ 401 Validation errors:', validationErrors)
                    } else {
                        console.error('❌ 401 Invalid credentials')
                    }
                    return null
                case 403:
                    console.error('❌ 403 Access denied')
                    return null
                case 422:
                    console.error('🔍 Validation Error Details:', {
                        message: errorData?.message,
                        errors: errorData?.errors,
                        fullErrors: JSON.stringify(errorData?.errors, null, 2)
                    })
                    
                    const validationErrors = errorData?.errors || {}
                    const errorMessages = Object.values(validationErrors).flat()
                    
                    if (errorMessages.length > 0) {
                        // Log chi tiết lỗi validation
                        const detailedErrors = Object.entries(validationErrors).map(([field, messages]) => {
                            return `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`
                        }).join('; ')
                        
                        console.error('❌ 422 Validation failed:', detailedErrors)
                    } else {
                        console.error('❌ 422 Validation failed:', errorData?.message)
                    }
                    return null
                case 429:
                    console.error('❌ 429 Too many requests')
                    return null
                case 500:
                    console.error('❌ 500 Server error')
                    return null
                default:
                    console.error(`❌ ${status} Error:`, errorData?.message)
                    return null
            }
        } else if (error.request) {
            // Lỗi network
            console.error('🌐 Network Error:', error.request)
            return null
        } else if (error.code === 'ECONNREFUSED') {
            console.error('🔌 Connection Refused:', error.code)
            return null
        } else if (error.code === 'ENOTFOUND') {
            console.error('🔍 Host Not Found:', error.code)
            return null
        } else {
            // Lỗi khác
            console.error('❓ Unknown Error:', error)
            return null
        }
    }
}

export default validateCredential

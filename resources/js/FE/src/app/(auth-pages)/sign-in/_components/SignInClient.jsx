'use client'
import SignIn from '@/components/auth/SignIn'
import { REDIRECT_URL_KEY } from '@/constants/app.constant'
import { useSearchParams, useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import appConfig from '@/configs/app.config'
import { useState } from 'react'

const SignInClient = () => {
    const searchParams = useSearchParams()
    const router = useRouter()
    const callbackUrl = searchParams.get(REDIRECT_URL_KEY)
    const [errorMessage, setErrorMessage] = useState('') // State để lưu trữ lỗi

    const handleSignIn = async ({ values, setSubmitting, setMessage }) => {
        try {
            setSubmitting(true)
            setMessage('') // Clear previous messages
            setErrorMessage('') // Clear previous error messages
            
            console.log('[sign-in] Start sign in with credentials', {
                login: values?.login,
                callbackUrl,
                apiBaseUrl: appConfig.API_BASE_URL
            })
            
            // Use NextAuth signIn with credentials provider
            // This will call validateCredential() which handles the API call
            const result = await signIn('credentials', {
                login: values.login,
                password: values.password,
                redirect: false,
            })
            
            console.log('[sign-in] signIn("credentials") result:', result)
            
            // Kiểm tra cả ok và error để xử lý đúng
            if (result?.ok && !result?.error) {
                // Chỉ redirect khi thực sự thành công và không có lỗi
                console.log('[sign-in] Sign in successful, redirecting to:', callbackUrl || appConfig.authenticatedEntryPath)
                router.push(callbackUrl || appConfig.authenticatedEntryPath)
            } else {
                // Có lỗi hoặc không thành công
                console.log('[sign-in] Sign in failed:', result)
                
                // Xử lý các loại lỗi khác nhau
                let errorMessage = 'Đăng nhập thất bại'
                
                if (result?.error) {
                    switch (result.error) {
                        case 'CredentialsSignin':
                            // Lỗi này xảy ra khi validateCredential return null
                            // Kiểm tra xem có error details không
                            if (result?.error_description) {
                                errorMessage = result.error_description
                            } else {
                                errorMessage = 'Email/phone hoặc mật khẩu không đúng'
                            }
                            break
                        case 'AccessDenied':
                            errorMessage = 'Tài khoản của bạn đã bị khóa hoặc không có quyền truy cập'
                            break
                        case 'Verification':
                            errorMessage = 'Tài khoản chưa được xác thực'
                            break
                        case 'Configuration':
                            errorMessage = 'Lỗi cấu hình hệ thống. Vui lòng liên hệ admin'
                            console.error('❌ Configuration error - check NextAuth setup')
                            break
                        default:
                            // Nếu có error_description, sử dụng nó
                            if (result?.error_description) {
                                errorMessage = result.error_description
                            } else {
                                errorMessage = result.error
                            }
                    }
                } else if (result?.ok && result?.error) {
                    // Trường hợp đặc biệt: ok: true nhưng vẫn có error
                    errorMessage = 'Đăng nhập thất bại do lỗi hệ thống'
                    console.error('❌ NextAuth returned ok: true but with error:', result.error)
                }
                
                // Lưu lỗi vào state để hiển thị
                setErrorMessage(errorMessage)
                setMessage(errorMessage)
            }
        } catch (error) {
            console.error('[sign-in] Login error:', error)
            
            // Xử lý các loại lỗi khác nhau
            let errorMessage = 'Đăng nhập thất bại'
            
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                errorMessage = 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng'
            } else if (error.response) {
                // Lỗi từ API response
                const status = error.response.status
                switch (status) {
                    case 401:
                        errorMessage = 'Email/phone hoặc mật khẩu không đúng'
                        break
                    case 403:
                        errorMessage = 'Tài khoản của bạn đã bị khóa hoặc không có quyền truy cập'
                        break
                    case 422:
                        errorMessage = 'Dữ liệu đăng nhập không hợp lệ'
                        break
                    case 500:
                        errorMessage = 'Lỗi máy chủ. Vui lòng thử lại sau'
                        break
                    default:
                        errorMessage = `Lỗi ${status}: ${error.response.data?.message || 'Đăng nhập thất bại'}`
                }
            } else if (error.request) {
                // Lỗi network
                errorMessage = 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng'
            } else {
                // Lỗi khác
                errorMessage = error.message || 'Đăng nhập thất bại'
            }
            
            // Lưu lỗi vào state để hiển thị
            setErrorMessage(errorMessage)
            setMessage(errorMessage)
        } finally {
            console.log('[sign-in] Sign in flow completed')
            setSubmitting(false)
        }
    }

    return (
        <SignIn 
            onSignIn={handleSignIn} 
            errorMessage={errorMessage} // Truyền lỗi xuống SignIn component
        />
    )
}

export default SignInClient

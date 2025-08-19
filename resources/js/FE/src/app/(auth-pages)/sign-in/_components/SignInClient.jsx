'use client'
import SignIn from '@/components/auth/SignIn'
import { REDIRECT_URL_KEY } from '@/constants/app.constant'
import { useSearchParams, useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import appConfig from '@/configs/app.config'

const SignInClient = () => {
    const searchParams = useSearchParams()
    const router = useRouter()
    const callbackUrl = searchParams.get(REDIRECT_URL_KEY)

    const handleSignIn = async ({ values, setSubmitting, setMessage }) => {
        try {
            setSubmitting(true)
            console.log('[sign-in] Start sign in with credentials', {
                login: values?.login,
                callbackUrl,
            })
            
            // Use NextAuth signIn with credentials provider
            // This will call validateCredential() which handles the API call
            const result = await signIn('credentials', {
                login: values.login,
                password: values.password,
                redirect: false,
            })
            console.log('[sign-in] signIn("credentials") result:', result)
            
            if (result?.ok) {
                // Redirect to callback URL or default authenticated path
                console.log('[sign-in] Redirecting to:', callbackUrl || appConfig.authenticatedEntryPath)
                router.push(callbackUrl || appConfig.authenticatedEntryPath)
            } else {
                console.log('[sign-in] Sign in failed:', result)
                setMessage(result?.error || 'Invalid credentials')
            }
        } catch (error) {
            console.error('[sign-in] Login error:', error)
            setMessage('Login failed')
        } finally {
            console.log('[sign-in] Sign in flow completed')
            setSubmitting(false)
        }
    }



    return <SignIn onSignIn={handleSignIn} />
}

export default SignInClient

'use client'
import SignIn from '@/components/auth/SignIn'
import handleOauthSignIn from '@/server/actions/auth/handleOauthSignIn'
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
            
            // Use NextAuth signIn with credentials provider
            // This will call validateCredential() which handles the API call
            const result = await signIn('credentials', {
                login: values.login,
                password: values.password,
                redirect: false,
            })
            
            if (result?.ok) {
                // Redirect to callback URL or default authenticated path
                router.push(callbackUrl || appConfig.authenticatedEntryPath)
            } else {
                setMessage(result?.error || 'Invalid credentials')
            }
        } catch (error) {
            console.error('Login error:', error)
            setMessage('Login failed')
        } finally {
            setSubmitting(false)
        }
    }

    const handleOAuthSignIn = async ({ type }) => {
        if (type === 'google') {
            await handleOauthSignIn('google')
        }
        if (type === 'github') {
            await handleOauthSignIn('github')
        }
    }

    return <SignIn onSignIn={handleSignIn} onOauthSignIn={handleOAuthSignIn} />
}

export default SignInClient

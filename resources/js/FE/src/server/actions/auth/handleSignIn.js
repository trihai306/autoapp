'use server'
import { signIn } from '@/auth'
import appConfig from '@/configs/app.config'
import { AuthError } from 'next-auth'
import { redirect } from 'next/navigation'

export const onSignInWithCredentials = async (
    { login, password },
    callbackUrl,
) => {
    try {
        await signIn('credentials', {
            login,
            password,
            redirectTo: callbackUrl || appConfig.authenticatedEntryPath,
        })
    } catch (error) {

        
        // Handle NEXT_REDIRECT which is expected behavior for successful sign in
        if (error?.message?.includes('NEXT_REDIRECT')) {
            // This is expected - NextAuth redirects on successful sign in
            return
        }
        
        if (error instanceof AuthError) {
            /** Customize error message based on AuthError */
            switch (error.type) {
                case 'CredentialsSignin':
                    return { error: 'Invalid credentials!' }
                default:
                    return { error: 'Something went wrong!' }
            }
        }
        throw error
    }
}

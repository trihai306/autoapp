// resources/js/FE/src/server/actions/auth/handleSignOut.js
'use server'

import { signOut } from '@/auth'
import appConfig from '@/configs/app.config'
import { apiLogout } from '@/services/auth/AuthService'
import { withAuthCheck } from '@/utils/withAuthCheck'
import { revalidatePath } from 'next/cache'

/**
 * Server Action to handle user sign-out.
 * It first attempts to log out from the API backend, clears all cached data,
 * and then signs out from NextAuth to completely clear user session.
 * The logic is wrapped with `withAuthCheck` for consistent error handling.
 */
async function handleSignOut() {
    try {
        // We wrap the API call part. If this fails due to 401, withAuthCheck will redirect.
        // If it succeeds, or fails with another error, it proceeds.
        await withAuthCheck(async () => {
            // apiLogout doesn't need the token passed anymore, ApiService handles it
            await apiLogout()
        }).catch(error => {
            // Log non-authentication errors but proceed with client-side sign-out anyway
            console.error('Failed to log out from server (non-auth error):', error)
        })
    } catch (error) {
        console.error('Error during server logout:', error)
    }

    try {
        // Clear all cached data and revalidate paths
        revalidatePath('/', 'layout')
        
        // Clear any other cached paths that might contain user data
        revalidatePath('/profile', 'page')
        revalidatePath('/dashboard', 'layout')
        
    } catch (error) {
        console.error('Error clearing cache:', error)
    }

    // Always sign out from the client-side session and clear all NextAuth data
    await signOut({ 
        redirectTo: appConfig.unAuthenticatedEntryPath,
        redirect: true 
    })
}

export default handleSignOut

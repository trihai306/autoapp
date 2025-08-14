// resources/js/FE/src/utils/withAuthCheck.js
'use server'

import { UnauthorizedError } from '@/errors'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

/**
 * A higher-order function that wraps a server action's logic to provide centralized authentication checking.
 * @param {Function} actionLogic The async function containing the core server action logic.
 * @returns The result of the actionLogic, or redirects on authentication failure.
 */
export async function withAuthCheck(actionLogic) {
    // console.log('withAuthCheck: Starting execution')
    try {
        // Execute the actual logic
        const result = await actionLogic()
        // console.log('withAuthCheck: Action completed successfully')
        return result
    } catch (error) {    
        // If it's the specific error we're looking for, redirect.
        if (error instanceof UnauthorizedError || 
            (error.name === 'AxiosError' && error?.response?.status === 401) ||
            error?.status === 401) {
            // console.log('401 Unauthorized detected - performing redirect')
            
            // Clear any cached data
            revalidatePath('/', 'layout')
            
            // Redirect to force logout page
            // This should work in server actions
            redirect('/force-logout')
        }
        
        // For any other error, re-throw it so we can debug it.
        // This prevents swallowing other important errors.
        throw error
    }
}

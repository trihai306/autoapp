// resources/js/FE/src/utils/withAuthCheck.js
'use server'

import { UnauthorizedError } from '@/errors'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

/**
 * A higher-order function that wraps a server action's logic to provide centralized authentication checking.
 * @param {Function} actionLogic The async function containing the core server action logic.
 * @returns The result of the actionLogic, or redirects on authentication/authorization failure.
 */
export async function withAuthCheck(actionLogic) {
    // console.log('withAuthCheck: Starting execution')
    try {
        // Execute the actual logic
        const result = await actionLogic()
        // console.log('withAuthCheck: Action completed successfully')
        return result
    } catch (error) {    
        // Handle 401 Unauthorized - User not authenticated
        if (error instanceof UnauthorizedError || 
            (error.name === 'AxiosError' && error?.response?.status === 401) ||
            error?.status === 401) {
            // console.log('401 Unauthorized detected - performing redirect')
            
            // Clear any cached data
            revalidatePath('/', 'layout')
            
            // Redirect to force logout page
            redirect('/force-logout')
        }
        
        // Handle 403 Forbidden - User authenticated but no permission
        if ((error.name === 'AxiosError' && error?.response?.status === 403) ||
            error?.status === 403) {
            // console.log('403 Forbidden detected - redirecting to 403 page')
            
            // Clear any cached data
            revalidatePath('/', 'layout')
            
            // Redirect to 403 page
            redirect('/403')
        }
        
        // For any other error, re-throw it so we can debug it.
        // This prevents swallowing other important errors.
        throw error
    }
}

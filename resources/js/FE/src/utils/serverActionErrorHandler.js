// resources/js/FE/src/utils/serverActionErrorHandler.js

import { UnauthorizedError } from '@/errors'

/**
 * Handles errors in server actions consistently
 * Re-throws authentication errors so withAuthCheck can handle them
 * Returns error response for other errors
 */
export function handleServerActionError(error, defaultMessage = "An unexpected error occurred.") {
    console.error("Server action error:", {
        name: error.name,
        message: error.message,
        status: error?.response?.status,
        isAxiosError: error.name === 'AxiosError'
    })
    
    // Re-throw authentication errors so withAuthCheck can handle them
    if (error.name === 'UnauthorizedError' || 
        error?.response?.status === 401 || 
        (error.name === 'AxiosError' && error?.response?.status === 401)) {
        
        // console.log('Re-throwing as UnauthorizedError for withAuthCheck')
        throw new UnauthorizedError('Authentication failed')
    }
    
    return { 
        success: false, 
        message: error?.response?.data?.message || defaultMessage 
    }
}

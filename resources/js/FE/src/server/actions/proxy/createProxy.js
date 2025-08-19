'use server'

import { apiCreateProxy } from '@/services/proxy/ProxyService'
import { withAuthCheck } from '@/utils/withAuthCheck'
import { handleServerActionError } from '@/utils/serverActionErrorHandler'

export default async function createProxy(data) {
    return withAuthCheck(async () => {
        try {
            const response = await apiCreateProxy(data)
            return {
                success: true,
                message: 'Proxy created successfully',
                data: response,
            }
        } catch (error) {
            // Handle validation errors before using handleServerActionError
            if (error.response?.status === 422) {
                const validationErrors = error.response.data?.errors || {}
                const errorMessages = Object.values(validationErrors).flat()
                return {
                    success: false,
                    message: errorMessages.length > 0 ? errorMessages.join(', ') : 'Validation failed',
                    errors: validationErrors
                }
            }
            
            return handleServerActionError(error, "An unexpected error occurred while creating proxy.")
        }
    })
}

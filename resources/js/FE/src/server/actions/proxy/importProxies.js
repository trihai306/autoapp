'use server'

import { apiImportProxies } from '@/services/proxy/ProxyService'
import { withAuthCheck } from '@/utils/withAuthCheck'

export default async function importProxies(data) {
    return withAuthCheck(async () => {
        try {
            const response = await apiImportProxies(data)
            return {
                success: true,
                message: 'Proxies imported successfully',
                data: response,
            }
        } catch (error) {
            console.error("Error importing proxies:", error)
            
            // Handle validation errors
            if (error.response?.status === 422) {
                const validationErrors = error.response.data?.errors || {}
                const errorMessages = Object.values(validationErrors).flat()
                return {
                    success: false,
                    message: errorMessages.length > 0 ? errorMessages.join(', ') : 'Validation failed',
                    errors: validationErrors
                }
            }
            
            return {
                success: false,
                message: error.response?.data?.message || "An unexpected error occurred while importing proxies.",
            }
        }
    })
}

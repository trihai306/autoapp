'use server'

import { apiCreateServicePackageTier } from '@/services/service-package/ServicePackageService'
import { withAuthCheck } from '@/utils/withAuthCheck'
import { handleServerActionError } from '@/utils/serverActionErrorHandler'

/**
 * Server Action to create a new service package tier.
 */
export default async function createServicePackageTier(data) {
    return withAuthCheck(async () => {
        try {
            const response = await apiCreateServicePackageTier(data)
            return {
                success: true,
                data: response.data,
                message: response.message || 'Service package tier created successfully'
            }
        } catch (error) {
            console.error('❌ [createServicePackageTier] Error:', error)
            return handleServerActionError(error, 'Failed to create service package tier')
        }
    })
}

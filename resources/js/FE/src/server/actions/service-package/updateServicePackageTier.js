'use server'

import { apiUpdateServicePackageTier } from '@/services/service-package/ServicePackageService'
import { withAuthCheck } from '@/utils/withAuthCheck'
import { handleServerActionError } from '@/utils/serverActionErrorHandler'

/**
 * Server Action to update a service package tier.
 */
export default async function updateServicePackageTier(id, data) {
    return withAuthCheck(async () => {
        try {
            const response = await apiUpdateServicePackageTier(id, data)
            return {
                success: true,
                data: response.data,
                message: response.message || 'Service package tier updated successfully'
            }
        } catch (error) {
            console.error('❌ [updateServicePackageTier] Error:', error)
            return handleServerActionError(error, 'Failed to update service package tier')
        }
    })
}

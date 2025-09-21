'use server'

import { apiDeleteServicePackageTier } from '@/services/service-package/ServicePackageService'
import { withAuthCheck } from '@/utils/withAuthCheck'
import { handleServerActionError } from '@/utils/serverActionErrorHandler'

/**
 * Server Action to delete a service package tier.
 */
export default async function deleteServicePackageTier(id) {
    return withAuthCheck(async () => {
        try {
            const response = await apiDeleteServicePackageTier(id)
            return {
                success: true,
                data: response.data,
                message: response.message || 'Service package tier deleted successfully'
            }
        } catch (error) {
            console.error('❌ [deleteServicePackageTier] Error:', error)
            return handleServerActionError(error, 'Failed to delete service package tier')
        }
    })
}

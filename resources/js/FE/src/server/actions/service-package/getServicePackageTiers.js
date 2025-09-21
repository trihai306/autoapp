'use server'

import { apiGetServicePackageTiers } from '@/services/service-package/ServicePackageService'
import { withAuthCheck } from '@/utils/withAuthCheck'
import { handleServerActionError } from '@/utils/serverActionErrorHandler'

/**
 * Server Action to fetch service package tiers with pagination, search, and filters.
 */
export default async function getServicePackageTiers(params = {}) {
    return withAuthCheck(async () => {
        try {
            const response = await apiGetServicePackageTiers(params)
            return {
                success: true,
                data: response.data || [],
                total: response.total || 0,
                message: response.message || 'Service package tiers fetched successfully'
            }
        } catch (error) {
            console.error('❌ [getServicePackageTiers] Error:', error)
            return handleServerActionError(error, 'Failed to fetch service package tiers')
        }
    })
}

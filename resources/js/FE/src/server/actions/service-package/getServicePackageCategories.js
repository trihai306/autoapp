'use server'

import { apiGetServicePackageCategories } from '@/services/service-package/ServicePackageService'
import { withAuthCheck } from '@/utils/withAuthCheck'
import { handleServerActionError } from '@/utils/serverActionErrorHandler'

/**
 * Server Action to fetch service package categories with pagination, search, and filters.
 */
export default async function getServicePackageCategories(params = {}) {
    return withAuthCheck(async () => {
        try {
            const response = await apiGetServicePackageCategories(params)
            return {
                success: true,
                data: response.data || [],
                total: response.total || 0,
                message: response.message || 'Service package categories fetched successfully'
            }
        } catch (error) {
            console.error('❌ [getServicePackageCategories] Error:', error)
            return handleServerActionError(error, 'Failed to fetch service package categories')
        }
    })
}

'use server'

import { apiGetServicePackages } from '@/services/service-package/ServicePackageService'
import { withAuthCheck } from '@/utils/withAuthCheck'
import { handleServerActionError } from '@/utils/serverActionErrorHandler'

/**
 * Server Action to fetch service packages with pagination, search, and filters.
 * The core logic is wrapped with `withAuthCheck` to handle authentication errors centrally.
 */
export default async function getServicePackages(params = {}) {
    return withAuthCheck(async () => {
        try {
            const response = await apiGetServicePackages(params)
            return {
                success: true,
                data: response.data || [],
                pagination: response.pagination || null,
                total: response.total || 0,
                dataLength: response.data?.length || 0,
            }
        } catch (error) {
            console.error('❌ [getServicePackages] Error:', error)
            return handleServerActionError(error, 'Failed to fetch service packages')
        }
    })
}

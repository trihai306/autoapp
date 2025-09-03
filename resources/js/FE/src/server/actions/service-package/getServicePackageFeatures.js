'use server'

import { apiGetServicePackageFeatures } from '@/services/service-package/ServicePackageFeatureService'
import { withAuthCheck } from '@/utils/withAuthCheck'
import { handleServerActionError } from '@/utils/serverActionErrorHandler'

/**
 * Server Action to fetch features for a specific service package.
 * The core logic is wrapped with `withAuthCheck` to handle authentication errors centrally.
 */
export default async function getServicePackageFeatures(packageId, params = {}) {
    return withAuthCheck(async () => {
        try {
            if (!packageId) {
                return {
                    success: false,
                    message: 'ID gói dịch vụ không hợp lệ',
                    data: []
                }
            }

            const response = await apiGetServicePackageFeatures(packageId, params)
            
            return {
                success: true,
                data: response.data || [],
                total: response.total || 0,
                message: 'Service package features retrieved successfully'
            }
        } catch (error) {
            console.error('❌ [getServicePackageFeatures] Error:', error)
            return handleServerActionError(error, 'Failed to fetch service package features')
        }
    })
}

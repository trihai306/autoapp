'use server'

import { apiCompareServicePackages } from '@/services/service-package/ServicePackageService'
import { withAuthCheck } from '@/utils/withAuthCheck'

/**
 * Server Action to compare service packages.
 * The core logic is wrapped with `withAuthCheck` to handle authentication errors centrally.
 */
export default async function compareServicePackages(packageIds) {
    return withAuthCheck(async () => {
        try {
            if (!packageIds || packageIds.length < 2) {
                return {
                    success: false,
                    message: 'Cần ít nhất 2 gói dịch vụ để so sánh'
                }
            }

            const response = await apiCompareServicePackages(packageIds)
            
            return {
                success: true,
                data: response,
                message: 'Service packages compared successfully'
            }
        } catch (error) {
            console.error('Error comparing service packages:', error)
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to compare service packages',
                data: null
            }
        }
    })
}

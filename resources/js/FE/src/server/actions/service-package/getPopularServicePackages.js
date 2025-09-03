'use server'

import { apiGetPopularServicePackages } from '@/services/service-package/ServicePackageService'
import { withAuthCheck } from '@/utils/withAuthCheck'

/**
 * Server Action to fetch popular service packages.
 * The core logic is wrapped with `withAuthCheck` to handle authentication errors centrally.
 */
export default async function getPopularServicePackages() {
    return withAuthCheck(async () => {
        try {
            const response = await apiGetPopularServicePackages()
            
            return {
                success: true,
                data: response.data || [],
                message: 'Popular service packages retrieved successfully'
            }
        } catch (error) {
            console.error('Error fetching popular service packages:', error)
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to fetch popular service packages',
                data: []
            }
        }
    })
}

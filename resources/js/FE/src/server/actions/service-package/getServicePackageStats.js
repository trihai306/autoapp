'use server'

import { apiGetServicePackageStats } from '@/services/service-package/ServicePackageService'
import { withAuthCheck } from '@/utils/withAuthCheck'

/**
 * Server Action to fetch service package statistics.
 * The core logic is wrapped with `withAuthCheck` to handle authentication errors centrally.
 */
export default async function getServicePackageStats() {
    return withAuthCheck(async () => {
        try {
            const response = await apiGetServicePackageStats()
            
            return {
                success: true,
                data: response.data || {
                    totalPackages: 0,
                    activePackages: 0,
                    inactivePackages: 0,
                    popularPackages: 0,
                    freePackages: 0,
                    paidPackages: 0
                },
                message: 'Service package statistics retrieved successfully'
            }
        } catch (error) {
            console.error('Error fetching service package statistics:', error)
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to fetch service package statistics',
                data: {
                    totalPackages: 0,
                    activePackages: 0,
                    inactivePackages: 0,
                    popularPackages: 0,
                    freePackages: 0,
                    paidPackages: 0
                }
            }
        }
    })
}

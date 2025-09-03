'use server'

import { apiGetServicePackage } from '@/services/service-package/ServicePackageService'
import { withAuthCheck } from '@/utils/withAuthCheck'

/**
 * Server Action to fetch a single service package by ID or slug.
 * The core logic is wrapped with `withAuthCheck` to handle authentication errors centrally.
 */
export default async function getServicePackage(id) {
    return withAuthCheck(async () => {
        try {
            const response = await apiGetServicePackage(id)
            
            return {
                success: true,
                data: response,
                message: 'Service package retrieved successfully'
            }
        } catch (error) {
            console.error('Error fetching service package:', error)
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to fetch service package',
                data: null
            }
        }
    })
}

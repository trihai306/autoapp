'use server'

import { apiCreateServicePackageCategory } from '@/services/service-package/ServicePackageService'
import { withAuthCheck } from '@/utils/withAuthCheck'
import { handleServerActionError } from '@/utils/serverActionErrorHandler'

/**
 * Server Action to create a new service package category.
 */
export default async function createServicePackageCategory(data) {
    return withAuthCheck(async () => {
        try {
            const response = await apiCreateServicePackageCategory(data)
            return {
                success: true,
                data: response.data,
                message: response.message || 'Service package category created successfully'
            }
        } catch (error) {
            console.error('❌ [createServicePackageCategory] Error:', error)
            return handleServerActionError(error, 'Failed to create service package category')
        }
    })
}

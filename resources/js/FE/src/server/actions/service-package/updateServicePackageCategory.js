'use server'

import { apiUpdateServicePackageCategory } from '@/services/service-package/ServicePackageService'
import { withAuthCheck } from '@/utils/withAuthCheck'
import { handleServerActionError } from '@/utils/serverActionErrorHandler'

/**
 * Server Action to update a service package category.
 */
export default async function updateServicePackageCategory(id, data) {
    return withAuthCheck(async () => {
        try {
            const response = await apiUpdateServicePackageCategory(id, data)
            return {
                success: true,
                data: response.data,
                message: response.message || 'Service package category updated successfully'
            }
        } catch (error) {
            console.error('❌ [updateServicePackageCategory] Error:', error)
            return handleServerActionError(error, 'Failed to update service package category')
        }
    })
}

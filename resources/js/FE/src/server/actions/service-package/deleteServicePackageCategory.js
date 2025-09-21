'use server'

import { apiDeleteServicePackageCategory } from '@/services/service-package/ServicePackageService'
import { withAuthCheck } from '@/utils/withAuthCheck'
import { handleServerActionError } from '@/utils/serverActionErrorHandler'

/**
 * Server Action to delete a service package category.
 */
export default async function deleteServicePackageCategory(id) {
    return withAuthCheck(async () => {
        try {
            const response = await apiDeleteServicePackageCategory(id)
            return {
                success: true,
                data: response.data,
                message: response.message || 'Service package category deleted successfully'
            }
        } catch (error) {
            console.error('❌ [deleteServicePackageCategory] Error:', error)
            return handleServerActionError(error, 'Failed to delete service package category')
        }
    })
}

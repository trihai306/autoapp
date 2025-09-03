'use server'

import { apiDeleteServicePackageFeature } from '@/services/service-package/ServicePackageFeatureService'
import { revalidatePath } from 'next/cache'
import { withAuthCheck } from '@/utils/withAuthCheck'
import { handleServerActionError } from '@/utils/serverActionErrorHandler'

/**
 * Server Action to delete a service package feature.
 * The core logic is wrapped with `withAuthCheck` to handle authentication errors centrally.
 */
export default async function deleteServicePackageFeature(featureId) {
    return withAuthCheck(async () => {
        try {
            const response = await apiDeleteServicePackageFeature(featureId)
            
            revalidatePath('/concepts/service-package-management')
            
            return {
                success: true,
                message: 'Xóa tính năng gói dịch vụ thành công'
            }
        } catch (error) {
            console.error('❌ [deleteServicePackageFeature] Error:', error)
            return handleServerActionError(error, 'Failed to delete service package feature')
        }
    })
}

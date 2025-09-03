'use server'

import { apiBulkDeleteServicePackageFeatures } from '@/services/service-package/ServicePackageFeatureService'
import { revalidatePath } from 'next/cache'
import { withAuthCheck } from '@/utils/withAuthCheck'
import { handleServerActionError } from '@/utils/serverActionErrorHandler'

/**
 * Server Action to bulk delete service package features.
 * The core logic is wrapped with `withAuthCheck` to handle authentication errors centrally.
 */
export default async function bulkDeleteServicePackageFeatures(featureIds) {
    return withAuthCheck(async () => {
        try {
            if (!featureIds || featureIds.length === 0) {
                return {
                    success: false,
                    message: 'Không có tính năng nào được chọn để xóa'
                }
            }

            const response = await apiBulkDeleteServicePackageFeatures(featureIds)
            
            revalidatePath('/concepts/service-package-management')
            
            return {
                success: true,
                message: `Đã xóa ${featureIds.length} tính năng thành công`
            }
        } catch (error) {
            console.error('❌ [bulkDeleteServicePackageFeatures] Error:', error)
            return handleServerActionError(error, 'Failed to bulk delete service package features')
        }
    })
}

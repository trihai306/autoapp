'use server'

import { apiDeleteServicePackage } from '@/services/service-package/ServicePackageService'
import { revalidatePath } from 'next/cache'
import { withAuthCheck } from '@/utils/withAuthCheck'
import { handleServerActionError } from '@/utils/serverActionErrorHandler'

/**
 * Server Action to delete a service package.
 * The core logic is wrapped with `withAuthCheck` to handle authentication errors centrally.
 */
export default async function deleteServicePackage(id) {
    return withAuthCheck(async () => {
        try {
            const response = await apiDeleteServicePackage(id)
            
            revalidatePath('/concepts/service-package-management')
            
            return {
                success: true,
                message: 'Xóa gói dịch vụ thành công'
            }
        } catch (error) {
            console.error('❌ [deleteServicePackage] Error:', error)
            return handleServerActionError(error, 'Failed to delete service package')
        }
    })
}

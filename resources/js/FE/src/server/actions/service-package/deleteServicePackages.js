'use server'

import { apiBulkDeleteServicePackages } from '@/services/service-package/ServicePackageService'
import { revalidatePath } from 'next/cache'
import { withAuthCheck } from '@/utils/withAuthCheck'
import { handleServerActionError } from '@/utils/serverActionErrorHandler'

/**
 * Server Action to delete multiple service packages.
 * The core logic is wrapped with `withAuthCheck` to handle authentication errors centrally.
 */
export default async function deleteServicePackages(ids) {
    return withAuthCheck(async () => {
        try {
            if (!ids || ids.length === 0) {
                return {
                    success: false,
                    message: 'Không có gói dịch vụ nào được chọn để xóa'
                }
            }

            const response = await apiBulkDeleteServicePackages(ids)
            
            revalidatePath('/concepts/service-package-management')
            
            return {
                success: true,
                message: `Đã xóa ${ids.length} gói dịch vụ thành công`
            }
        } catch (error) {
            console.error('❌ [deleteServicePackages] Error:', error)
            return handleServerActionError(error, 'Failed to delete service packages')
        }
    })
}

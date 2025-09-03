'use server'

import { apiBulkUpdateServicePackageStatus } from '@/services/service-package/ServicePackageService'
import { revalidatePath } from 'next/cache'
import { withAuthCheck } from '@/utils/withAuthCheck'
import { handleServerActionError } from '@/utils/serverActionErrorHandler'

/**
 * Server Action to update status of multiple service packages.
 * The core logic is wrapped with `withAuthCheck` to handle authentication errors centrally.
 */
export default async function updateServicePackageStatus(ids, status) {
    return withAuthCheck(async () => {
        try {
            if (!ids || ids.length === 0) {
                return {
                    success: false,
                    message: 'Không có gói dịch vụ nào được chọn'
                }
            }

            if (!status || !['active', 'inactive'].includes(status)) {
                return {
                    success: false,
                    message: 'Trạng thái không hợp lệ'
                }
            }

            const response = await apiBulkUpdateServicePackageStatus(ids, status)
            
            revalidatePath('/concepts/service-package-management')
            
            return {
                success: true,
                message: `Cập nhật trạng thái ${ids.length} gói dịch vụ thành công`
            }
        } catch (error) {
            console.error('❌ [updateServicePackageStatus] Error:', error)
            return handleServerActionError(error, 'Failed to update service package status')
        }
    })
}

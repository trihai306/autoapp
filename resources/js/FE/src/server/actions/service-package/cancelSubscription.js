'use server'

import { apiCancelSubscription } from '@/services/service-package/ServicePackagePaymentService'
import { withAuthCheck } from '@/utils/withAuthCheck'
import { handleServerActionError } from '@/utils/serverActionErrorHandler'

/**
 * Server Action để hủy subscription
 * @returns {Promise<Object>} Kết quả hủy
 */
export default async function cancelSubscription() {
    return withAuthCheck(async () => {
        try {
            const response = await apiCancelSubscription()
            
            return {
                success: true,
                data: response,
                message: 'Hủy gói dịch vụ thành công'
            }
        } catch (error) {
            return handleServerActionError(error, 'Hủy gói dịch vụ thất bại')
        }
    })
}

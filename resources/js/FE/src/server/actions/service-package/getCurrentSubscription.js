'use server'

import { apiGetCurrentSubscription } from '@/services/service-package/ServicePackagePaymentService'
import { withAuthCheck } from '@/utils/withAuthCheck'
import { handleServerActionError } from '@/utils/serverActionErrorHandler'

/**
 * Server Action để lấy subscription hiện tại của user
 * @returns {Promise<Object>} Subscription hiện tại
 */
export default async function getCurrentSubscription() {
    return withAuthCheck(async () => {
        try {
            const response = await apiGetCurrentSubscription()
            
            return {
                success: true,
                data: response.data || null,
                message: response.data ? 'Lấy subscription hiện tại thành công' : 'Bạn chưa có gói dịch vụ nào đang hoạt động'
            }
        } catch (error) {
            return handleServerActionError(error, 'Lấy subscription hiện tại thất bại')
        }
    })
}

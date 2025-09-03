'use server'

import { apiGetUserSubscriptions } from '@/services/service-package/ServicePackagePaymentService'
import { withAuthCheck } from '@/utils/withAuthCheck'
import { handleServerActionError } from '@/utils/serverActionErrorHandler'

/**
 * Server Action để lấy danh sách subscription của user
 * @param {Object} [params] - Tham số phân trang
 * @returns {Promise<Object>} Danh sách subscription
 */
export default async function getUserSubscriptions(params = {}) {
    return withAuthCheck(async () => {
        try {
            const response = await apiGetUserSubscriptions(params)
            
            return {
                success: true,
                data: response.data || [],
                pagination: response.pagination || null,
                total: response.total || 0,
                message: 'Lấy danh sách subscription thành công'
            }
        } catch (error) {
            return handleServerActionError(error, 'Lấy danh sách subscription thất bại')
        }
    })
}

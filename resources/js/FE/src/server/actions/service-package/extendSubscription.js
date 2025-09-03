'use server'

import { apiExtendSubscription } from '@/services/service-package/ServicePackagePaymentService'
import { withAuthCheck } from '@/utils/withAuthCheck'
import { handleServerActionError } from '@/utils/serverActionErrorHandler'

/**
 * Server Action để gia hạn subscription
 * @param {Object} data - Dữ liệu gia hạn
 * @param {number} [data.days] - Số ngày gia hạn
 * @param {number} [data.months] - Số tháng gia hạn
 * @param {number} [data.years] - Số năm gia hạn
 * @returns {Promise<Object>} Kết quả gia hạn
 */
export default async function extendSubscription(data) {
    return withAuthCheck(async () => {
        try {
            // Validation - ít nhất một trong các tham số phải có
            if (!data.days && !data.months && !data.years) {
                return {
                    success: false,
                    message: 'Vui lòng chọn thời gian gia hạn'
                }
            }

            const response = await apiExtendSubscription(data)
            
            return {
                success: true,
                data: response,
                message: 'Gia hạn gói dịch vụ thành công'
            }
        } catch (error) {
            return handleServerActionError(error, 'Gia hạn gói dịch vụ thất bại')
        }
    })
}

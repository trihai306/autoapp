'use server'

import { apiPurchaseServicePackage } from '@/services/service-package/ServicePackagePaymentService'
import { withAuthCheck } from '@/utils/withAuthCheck'
import { handleServerActionError } from '@/utils/serverActionErrorHandler'

/**
 * Server Action để mua gói dịch vụ
 * @param {Object} data - Dữ liệu mua gói
 * @param {number} data.service_package_id - ID gói dịch vụ
 * @param {string} [data.payment_method] - Phương thức thanh toán
 * @param {string} [data.notes] - Ghi chú
 * @returns {Promise<Object>} Kết quả mua gói
 */
export default async function purchaseServicePackage(data) {
    return withAuthCheck(async () => {
        try {
            console.log('🔍 [DEBUG] purchaseServicePackage called with data:', data)
            
            // Validation
            if (!data.service_package_id) {
                console.log('❌ [DEBUG] Invalid service_package_id')
                return {
                    success: false,
                    message: 'ID gói dịch vụ không hợp lệ'
                }
            }

            console.log('📡 [DEBUG] Calling API with data:', data)
            const response = await apiPurchaseServicePackage(data)
            console.log('✅ [DEBUG] API response:', response)
            
            return {
                success: true,
                data: response,
                message: 'Mua gói dịch vụ thành công'
            }
        } catch (error) {
            console.error('❌ [DEBUG] Error in purchaseServicePackage:', error)
            return handleServerActionError(error, 'Mua gói dịch vụ thất bại')
        }
    })
}

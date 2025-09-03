import ApiService from '@/services/ApiService'

/**
 * Service Package Payment Service
 * Xử lý các API liên quan đến thanh toán gói dịch vụ
 */

/**
 * Mua gói dịch vụ
 * @param {Object} data - Dữ liệu mua gói
 * @param {number} data.service_package_id - ID gói dịch vụ
 * @param {string} [data.payment_method] - Phương thức thanh toán
 * @param {string} [data.notes] - Ghi chú
 * @returns {Promise<Object>} Kết quả mua gói
 */
export async function apiPurchaseServicePackage(data) {
    console.log('🌐 [DEBUG] apiPurchaseServicePackage called with data:', data)
    
    try {
        const response = await ApiService.fetchDataWithAxios({
            url: '/service-packages/purchase',
            method: 'post',
            data
        })
        
        console.log('✅ [DEBUG] API response received:', response)
        return response
    } catch (error) {
        console.error('❌ [DEBUG] API error:', error)
        throw error
    }
}

/**
 * Lấy danh sách subscription của user
 * @param {Object} [params] - Tham số phân trang
 * @returns {Promise<Object>} Danh sách subscription
 */
export async function apiGetUserSubscriptions(params = {}) {
    return ApiService.fetchDataWithAxios({
        url: '/service-packages/my-subscriptions',
        method: 'get',
        params
    })
}

/**
 * Lấy subscription hiện tại của user
 * @returns {Promise<Object>} Subscription hiện tại
 */
export async function apiGetCurrentSubscription() {
    return ApiService.fetchDataWithAxios({
        url: '/service-packages/current-subscription',
        method: 'get'
    })
}

/**
 * Gia hạn subscription
 * @param {Object} data - Dữ liệu gia hạn
 * @param {number} [data.days] - Số ngày gia hạn
 * @param {number} [data.months] - Số tháng gia hạn
 * @param {number} [data.years] - Số năm gia hạn
 * @returns {Promise<Object>} Kết quả gia hạn
 */
export async function apiExtendSubscription(data) {
    return ApiService.fetchDataWithAxios({
        url: '/service-packages/extend',
        method: 'post',
        data
    })
}

/**
 * Hủy subscription
 * @returns {Promise<Object>} Kết quả hủy
 */
export async function apiCancelSubscription() {
    return ApiService.fetchDataWithAxios({
        url: '/service-packages/cancel',
        method: 'post'
    })
}

'use server'
import ApiService from '@/services/ApiService'
import { withAuthCheck } from '@/utils/withAuthCheck'

export default async function getInteractionScenarios(params = {}) {
    return withAuthCheck(async () => {
        try {
            // Tạo query string từ params
            const queryParams = new URLSearchParams()
            if (params.platform) {
                queryParams.append('platform', params.platform)
            }
            if (params.status) {
                queryParams.append('status', params.status)
            }

            const url = queryParams.toString()
                ? `/interaction-scenarios?${queryParams.toString()}`
                : '/interaction-scenarios'

            const res = await ApiService.fetchDataWithAxios({
                url: url,
                method: 'get',
            })

            // Kiểm tra response từ API
            if (res.success === false) {
                return {
                    success: false,
                    message: res.message || 'Không thể lấy danh sách kịch bản'
                }
            }

            return {
                success: true,
                data: res.data || [],
                message: res.message || 'Lấy danh sách kịch bản thành công'
            }
        } catch (error) {
            console.error('Error getting interaction scenarios:', error)
            return {
                success: false,
                message: error?.response?.data?.message || error?.message || 'Có lỗi xảy ra khi lấy danh sách kịch bản'
            }
        }
    })
}

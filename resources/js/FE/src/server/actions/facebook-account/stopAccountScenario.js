'use server'
import ApiService from '@/services/ApiService'
import { withAuthCheck } from '@/utils/withAuthCheck'

export default async function stopAccountScenario(accountId) {
    return withAuthCheck(async () => {
        try {
            const res = await ApiService.fetchDataWithAxios({
                url: `/facebook-accounts/${accountId}/stop-scenario`,
                method: 'post',
            })

            // Kiểm tra response từ API
            if (res.success === false) {
                return {
                    success: false,
                    message: res.message || 'Không thể dừng kịch bản'
                }
            }

            return {
                success: true,
                data: res.data,
                message: res.message || 'Dừng kịch bản thành công'
            }
        } catch (error) {
            console.error('Error stopping account scenario:', error)
            return {
                success: false,
                message: error?.response?.data?.message || error?.message || 'Có lỗi xảy ra khi dừng kịch bản'
            }
        }
    })
}

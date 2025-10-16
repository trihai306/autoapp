'use server'
import ApiService from '@/services/ApiService'
import { withAuthCheck } from '@/utils/withAuthCheck'

export default async function assignScenarioToAccount(accountId, scenarioId) {
    return withAuthCheck(async () => {
        try {
            const res = await ApiService.fetchDataWithAxios({
                url: `/facebook-accounts/${accountId}/assign-scenario`,
                method: 'post',
                data: { scenario_id: scenarioId },
            })

            // Kiểm tra response từ API
            if (res.success === false) {
                return {
                    success: false,
                    message: res.message || 'Không thể gán kịch bản'
                }
            }

            return {
                success: true,
                data: res.data,
                message: res.message || 'Gán kịch bản thành công'
            }
        } catch (error) {
            console.error('Error assigning scenario to account:', error)
            return {
                success: false,
                message: error?.response?.data?.message || error?.message || 'Có lỗi xảy ra khi gán kịch bản'
            }
        }
    })
}

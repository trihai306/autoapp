'use server'

import { withAuthCheck } from '@/utils/withAuthCheck'
import { apiBulkStopFacebookAccountsScenario } from '@/services/facebook-account/FacebookAccountService'

export default async function stopFacebookAccountsScenario(ids = []) {
    return withAuthCheck(async () => {
        try {
            const res = await apiBulkStopFacebookAccountsScenario(ids)
            return {
                success: res?.success !== false,
                data: res?.data || null,
                message: res?.message || 'Đã dừng kịch bản cho các tài khoản'
            }
        } catch (error) {
            return {
                success: false,
                message: error?.response?.data?.message || 'Không thể dừng kịch bản'
            }
        }
    })
}


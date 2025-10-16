'use server'

import { withAuthCheck } from '@/utils/withAuthCheck'
import { apiBulkRunFacebookAccounts } from '@/services/facebook-account/FacebookAccountService'

export default async function runFacebookAccountsScenario(ids = [], payload = { scenario_id: null, device_id: null }) {
    return withAuthCheck(async () => {
        try {
            const { scenario_id, device_id } = payload || {}
            const res = await apiBulkRunFacebookAccounts(ids, scenario_id, device_id)
            return {
                success: res?.success !== false,
                data: res?.data || null,
                message: res?.message || 'Đã chạy kịch bản cho các tài khoản'
            }
        } catch (error) {
            return {
                success: false,
                message: error?.response?.data?.message || 'Không thể chạy kịch bản'
            }
        }
    })
}



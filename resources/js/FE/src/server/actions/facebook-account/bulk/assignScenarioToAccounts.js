'use server'

import { withAuthCheck } from '@/utils/withAuthCheck'
import { apiBulkAssignScenarioToFacebookAccounts } from '@/services/facebook-account/FacebookAccountService'

export default async function assignScenarioToAccounts(ids = [], scenario_id) {
    return withAuthCheck(async () => {
        try {
            const res = await apiBulkAssignScenarioToFacebookAccounts(ids, scenario_id)
            return {
                success: res?.success !== false,
                data: res?.data || null,
                message: res?.message || 'Đã gán kịch bản cho các tài khoản'
            }
        } catch (error) {
            return {
                success: false,
                message: error?.response?.data?.message || 'Không thể gán kịch bản'
            }
        }
    })
}



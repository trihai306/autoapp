'use server'

import { withAuthCheck } from '@/utils/withAuthCheck'
import { apiBulkAssignDeviceToFacebookAccounts } from '@/services/facebook-account/FacebookAccountService'

export default async function assignDeviceToAccounts(ids = [], device_id) {
    return withAuthCheck(async () => {
        try {
            const res = await apiBulkAssignDeviceToFacebookAccounts(ids, device_id)
            return {
                success: res?.success !== false,
                data: res?.data || null,
                message: res?.message || 'Đã gán thiết bị cho các tài khoản'
            }
        } catch (error) {
            return {
                success: false,
                message: error?.response?.data?.message || 'Không thể gán thiết bị'
            }
        }
    })
}



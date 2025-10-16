'use server'

import { withAuthCheck } from '@/utils/withAuthCheck'
import { apiBulkDeleteFacebookAccounts } from '@/services/facebook-account/FacebookAccountService'

export default async function deleteFacebookAccounts(ids = []) {
    return withAuthCheck(async () => {
        try {
            const res = await apiBulkDeleteFacebookAccounts(ids)
            return {
                success: res?.success !== false,
                data: res?.data || null,
                message: res?.message || 'Đã xóa tài khoản thành công'
            }
        } catch (error) {
            return {
                success: false,
                message: error?.response?.data?.message || 'Không thể xóa tài khoản'
            }
        }
    })
}



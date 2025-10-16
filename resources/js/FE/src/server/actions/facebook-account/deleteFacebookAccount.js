'use server'

import { withAuthCheck } from '@/utils/withAuthCheck'
import { apiDeleteFacebookAccount } from '@/services/facebook-account/FacebookAccountService'

export default async function deleteFacebookAccount(accountId) {
    return withAuthCheck(async () => {
        try {
            const response = await apiDeleteFacebookAccount(accountId)
            return {
                success: true,
                message: response.message || 'Đã xóa tài khoản thành công',
                data: response.data || null,
            }
        } catch (error) {
            console.error('Error deleting Facebook account:', error)
            return {
                success: false,
                message: error.response?.data?.message || 'Có lỗi xảy ra khi xóa tài khoản'
            }
        }
    })
}

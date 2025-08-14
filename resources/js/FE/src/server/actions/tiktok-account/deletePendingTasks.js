'use server'

import { apiDeletePendingTasks } from '@/services/tiktok-account/TiktokAccountService'
import { withAuthCheck } from '@/utils/withAuthCheck'
import { handleServerActionError } from '@/utils/serverActionErrorHandler'

/**
 * Delete all pending tasks for specified TikTok accounts
 * @param {Array} accountIds - Array of account IDs
 * @returns {Object} Result object with success status and message
 */
export default async function deletePendingTasks(accountIds) {
    return withAuthCheck(async () => {
        try {
            if (!accountIds || !Array.isArray(accountIds) || accountIds.length === 0) {
                return {
                    success: false,
                    message: 'Không có tài khoản nào được chọn'
                }
            }

            const response = await apiDeletePendingTasks({
                account_ids: accountIds
            })

            return {
                success: true,
                message: 'Đã xóa tất cả pending tasks thành công',
                data: response.data || {}
            }

        } catch (error) {
            console.error('Error deleting pending tasks:', error)
            return handleServerActionError(error, 'Có lỗi xảy ra khi xóa pending tasks')
        }
    })
}

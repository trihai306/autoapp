'use server'

import { handleApiError } from '@/utils/errorHandler'
import { runFacebookLeaveGroupService } from '@/services/facebook-account/FacebookAccountService'

/**
 * Server action to run leave group interaction for Facebook account
 * @param {Object} payload - Leave group configuration
 * @param {number} payload.accountId - Facebook account ID
 * @param {Array} payload.groups - Array of groups to leave
 * @param {Object} payload.config - Leave group configuration
 * @returns {Promise<Object>} Result with success status and message
 */
export default async function runFacebookLeaveGroup(payload) {
    try {
        const { accountId, groups, config } = payload

        // Validate input
        if (!accountId) {
            return {
                success: false,
                message: 'ID tài khoản không hợp lệ'
            }
        }

        if (!groups || groups.length === 0) {
            return {
                success: false,
                message: 'Vui lòng nhập ít nhất một nhóm'
            }
        }

        // Call service
        const result = await runFacebookLeaveGroupService({
            accountId,
            groups,
            config
        })

        if (result.success) {
            return {
                success: true,
                message: result.message || `Đã gửi yêu cầu rời ${groups.length} nhóm thành công!`,
                data: result.data
            }
        }

        return {
            success: false,
            message: result.message || 'Không thể gửi yêu cầu rời nhóm'
        }
    } catch (error) {
        console.error('Error in runFacebookLeaveGroup:', error)
        const errorResult = handleApiError(error, { showToast: false })
        return {
            success: false,
            message: errorResult.message || 'Có lỗi xảy ra khi gửi yêu cầu rời nhóm'
        }
    }
}


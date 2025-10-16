'use server'

import { handleApiError } from '@/utils/errorHandler'
import { runFacebookJoinGroupService } from '@/services/facebook-account/FacebookAccountService'

/**
 * Server action to run join group interaction for Facebook account
 * @param {Object} payload - Join group configuration
 * @param {number} payload.accountId - Facebook account ID
 * @param {Array} payload.groups - Array of groups to join
 * @param {Object} payload.config - Join group configuration
 * @returns {Promise<Object>} Result with success status and message
 */
export default async function runFacebookJoinGroup(payload) {
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
        const result = await runFacebookJoinGroupService({
            accountId,
            groups,
            config
        })

        if (result.success) {
            return {
                success: true,
                message: result.message || `Đã gửi yêu cầu tham gia ${groups.length} nhóm thành công!`,
                data: result.data
            }
        }

        return {
            success: false,
            message: result.message || 'Không thể gửi yêu cầu tham gia nhóm'
        }
    } catch (error) {
        console.error('Error in runFacebookJoinGroup:', error)
        const errorResult = handleApiError(error, { showToast: false })
        return {
            success: false,
            message: errorResult.message || 'Có lỗi xảy ra khi gửi yêu cầu tham gia nhóm'
        }
    }
}


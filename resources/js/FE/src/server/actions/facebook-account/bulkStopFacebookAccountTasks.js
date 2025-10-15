'use server'

import { withAuthCheck } from '@/utils/withAuthCheck'
import { apiBulkStopFacebookAccountTasks } from '@/services/facebook-account/FacebookAccountService'

export default async function bulkStopFacebookAccountTasks(accountIds) {
    return withAuthCheck(async () => {
        try {
            const response = await apiBulkStopFacebookAccountTasks(accountIds)
            return {
                success: true,
                data: response.data || null,
                message: response.message || 'Bulk tasks stopped successfully'
            }
        } catch (error) {
            console.error('Error stopping bulk Facebook account tasks:', error)
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to stop bulk tasks'
            }
        }
    })
}

'use server'

import { withAuthCheck } from '@/utils/withAuthCheck'
import { apiStopFacebookAccountTasks } from '@/services/facebook-account/FacebookAccountService'

export default async function stopFacebookAccountTasks(accountId) {
    return withAuthCheck(async () => {
        try {
            const response = await apiStopFacebookAccountTasks(accountId)
            return {
                success: true,
                data: response.data || null,
                message: response.message || 'Tasks stopped successfully'
            }
        } catch (error) {
            console.error('Error stopping Facebook account tasks:', error)
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to stop tasks'
            }
        }
    })
}

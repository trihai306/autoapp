'use server'

import { withAuthCheck } from '@/utils/withAuthCheck'
import { apiGetFacebookAccountTasks } from '@/services/facebook-account/FacebookAccountService'

export default async function getFacebookAccountTasks(accountId, params = {}) {
    return withAuthCheck(async () => {
        try {
            const response = await apiGetFacebookAccountTasks(accountId, params)
            return {
                success: true,
                data: response.data || null,
                message: 'Tasks retrieved successfully'
            }
        } catch (error) {
            console.error('Error fetching Facebook account tasks:', error)
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to fetch tasks'
            }
        }
    })
}

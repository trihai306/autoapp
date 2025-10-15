'use server'

import { apiGetFacebookAccountStats } from '@/services/facebook-account/FacebookAccountService'
import { withAuthCheck } from '@/utils/withAuthCheck'

export default async function getFacebookAccountStats() {
    return withAuthCheck(async () => {
        try {
            const response = await apiGetFacebookAccountStats()
            return {
                success: true,
                data: response.data || { totalAccounts: 0, activeAccounts: 0, inactiveAccounts: 0, runningTasks: 0 },
                message: 'Facebook account statistics retrieved successfully'
            }
        } catch (error) {
            console.error('Error fetching Facebook account statistics:', error)
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to fetch Facebook account statistics',
                data: { totalAccounts: 0, activeAccounts: 0, inactiveAccounts: 0, runningTasks: 0 }
            }
        }
    })
}



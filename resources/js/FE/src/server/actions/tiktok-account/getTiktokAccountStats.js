'use server'

import { apiGetTiktokAccountStats } from '@/services/tiktok-account/TiktokAccountService'
import { withAuthCheck } from '@/utils/withAuthCheck'

export default async function getTiktokAccountStats() {
    return withAuthCheck(async () => {
        try {
            const response = await apiGetTiktokAccountStats()
            
            return {
                success: true,
                data: response.data || {
                    totalAccounts: 0,
                    activeAccounts: 0,
                    inactiveAccounts: 0,
                    runningTasks: 0
                },
                message: 'TikTok account statistics retrieved successfully'
            }
        } catch (error) {
            console.error('Error fetching TikTok account statistics:', error)
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to fetch TikTok account statistics',
                data: {
                    totalAccounts: 0,
                    activeAccounts: 0,
                    inactiveAccounts: 0,
                    runningTasks: 0
                }
            }
        }
    })
}

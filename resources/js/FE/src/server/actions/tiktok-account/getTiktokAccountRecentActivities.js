'use server'

import { apiGetTiktokAccountRecentActivities } from '@/services/tiktok-account/TiktokAccountService'
import { withAuthCheck } from '@/utils/withAuthCheck'

export default async function getTiktokAccountRecentActivities() {
    return withAuthCheck(async () => {
        try {
            const response = await apiGetTiktokAccountRecentActivities()
            
            return {
                success: true,
                data: response.data || [],
                message: 'TikTok account recent activities retrieved successfully'
            }
        } catch (error) {
            console.error('Error fetching TikTok account recent activities:', error)
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to fetch TikTok account recent activities',
                data: []
            }
        }
    })
}

'use server'

import { apiGetTiktokAccountActivityHistory } from '@/services/tiktokAccount/TiktokAccountService'
import { withAuthCheck } from '@/utils/withAuthCheck'

export default async function getTiktokAccountActivityHistory(id, params = {}) {
    return withAuthCheck(async () => {
        try {
            const response = await apiGetTiktokAccountActivityHistory(id, params)
            
            return {
                success: true,
                data: response.data,
                message: 'TikTok account activity history retrieved successfully'
            }
        } catch (error) {
            console.error('Error fetching TikTok account activity history:', error)
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to fetch activity history',
                data: null
            }
        }
    })
}

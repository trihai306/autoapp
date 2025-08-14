'use server'

import { apiGetTiktokAccount } from '@/services/tiktokAccount/TiktokAccountService'
import { withAuthCheck } from '@/utils/withAuthCheck'

export default async function getTiktokAccount(id) {
    return withAuthCheck(async () => {
        try {
            const response = await apiGetTiktokAccount(id)
            
            return {
                success: true,
                data: response,
                message: 'TikTok account retrieved successfully'
            }
        } catch (error) {
            console.error('Error fetching TikTok account:', error)
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to fetch TikTok account',
                data: null
            }
        }
    })
}
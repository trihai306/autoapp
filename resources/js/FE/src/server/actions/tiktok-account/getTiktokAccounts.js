'use server'

import { apiGetTiktokAccounts } from '@/services/tiktok-account/TiktokAccountService'
import { withAuthCheck } from '@/utils/withAuthCheck'

export default async function getTiktokAccounts(params = {}) {
    return withAuthCheck(async () => {
        try {
            const response = await apiGetTiktokAccounts(params)
            
            return {
                success: true,
                list: response.data || [],
                total: response.total || 0,
                message: 'Tiktok accounts retrieved successfully'
            }
        } catch (error) {
            console.error('Error fetching tiktok accounts:', error)
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to fetch tiktok accounts',
                list: [],
                total: 0
            }
        }
    })
} 
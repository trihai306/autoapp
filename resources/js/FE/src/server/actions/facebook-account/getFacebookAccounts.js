'use server'

import { apiGetFacebookAccounts } from '@/services/facebook-account/FacebookAccountService'
import { withAuthCheck } from '@/utils/withAuthCheck'

export default async function getFacebookAccounts(params = {}) {
    return withAuthCheck(async () => {
        try {
            const response = await apiGetFacebookAccounts(params)
            return {
                success: true,
                list: response.data || [],
                total: response.total || 0,
                message: 'Facebook accounts retrieved successfully'
            }
        } catch (error) {
            console.error('Error fetching facebook accounts:', error)
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to fetch facebook accounts',
                list: [],
                total: 0,
            }
        }
    })
}



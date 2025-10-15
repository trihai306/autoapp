'use server'

import { withAuthCheck } from '@/utils/withAuthCheck'
import { apiGetFacebookAccountStatus } from '@/services/facebook-account/FacebookAccountService'

export default async function getFacebookAccountStatus(accountId) {
    return withAuthCheck(async () => {
        try {
            const response = await apiGetFacebookAccountStatus(accountId)
            return {
                success: true,
                data: response.data || null,
                message: 'Account status retrieved successfully'
            }
        } catch (error) {
            console.error('Error fetching Facebook account status:', error)
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to fetch account status'
            }
        }
    })
}

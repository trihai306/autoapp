'use server'

import { withAuthCheck } from '@/utils/withAuthCheck'
import { apiGetAllFacebookAccountsStatus } from '@/services/facebook-account/FacebookAccountService'

export default async function getAllFacebookAccountsStatus(params = {}) {
    return withAuthCheck(async () => {
        try {
            const response = await apiGetAllFacebookAccountsStatus(params)
            return {
                success: true,
                data: response.data || null,
                message: 'All Facebook accounts status retrieved successfully'
            }
        } catch (error) {
            console.error('Error fetching all Facebook accounts status:', error)
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to fetch all accounts status'
            }
        }
    })
}

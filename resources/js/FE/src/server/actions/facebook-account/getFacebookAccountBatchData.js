'use server'

import { withAuthCheck } from '@/utils/withAuthCheck'
import { apiGetFacebookAccountBatchData } from '@/services/facebook-account/FacebookAccountService'

export default async function getFacebookAccountBatchData(params = {}) {
    return withAuthCheck(async () => {
        try {
            const response = await apiGetFacebookAccountBatchData(params)
            return {
                success: true,
                data: response.data || null,
                message: 'Facebook account batch data retrieved successfully'
            }
        } catch (error) {
            console.error('Error fetching Facebook account batch data:', error)
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to fetch batch data'
            }
        }
    })
}

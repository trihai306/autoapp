'use server'

import { withAuthCheck } from '@/utils/withAuthCheck'
import { apiGetFacebookAccount } from '@/services/facebook-account/FacebookAccountService'

export default async function getFacebookAccount(id) {
    return withAuthCheck(async () => {
        try {
            const response = await apiGetFacebookAccount(id)
            return {
                success: true,
                data: response.data || null,
                message: 'Facebook account retrieved successfully'
            }
        } catch (error) {
            console.error('Error fetching Facebook account:', error)
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to fetch Facebook account',
                data: null
            }
        }
    })
}

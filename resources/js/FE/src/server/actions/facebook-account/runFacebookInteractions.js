'use server'

import { withAuthCheck } from '@/utils/withAuthCheck'
import { apiRunFacebookInteractions } from '@/services/facebook-account/FacebookAccountService'

export default async function runFacebookInteractions(payload = {}) {
    return withAuthCheck(async () => {
        try {
            const res = await apiRunFacebookInteractions(payload)
            return {
                success: true,
                ...(res || {}),
            }
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || error.message || 'Failed to run interactions'
            }
        }
    })
}



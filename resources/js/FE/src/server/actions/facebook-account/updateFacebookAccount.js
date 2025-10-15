'use server'

import { withAuthCheck } from '@/utils/withAuthCheck'
import { apiUpdateFacebookAccount } from '@/services/facebook-account/FacebookAccountService'

export default async function updateFacebookAccount(id, payload) {
    return withAuthCheck(async () => {
        try {
            const response = await apiUpdateFacebookAccount(id, payload)
            return { success: true, data: response }
        } catch (error) {
            console.error('Error updating facebook account:', error)
            return { success: false, message: error.response?.data?.message || 'Failed to update facebook account' }
        }
    })
}



'use server'

import { withAuthCheck } from '@/utils/withAuthCheck'
import { apiImportFacebookAccounts } from '@/services/facebook-account/FacebookAccountService'

export default async function importFacebookAccounts(payload) {
    return withAuthCheck(async () => {
        try {
            const response = await apiImportFacebookAccounts(payload)
            return { success: true, ...response }
        } catch (error) {
            console.error('Error importing facebook accounts:', error)
            return { success: false, message: error.response?.data?.message || 'Failed to import facebook accounts' }
        }
    })
}



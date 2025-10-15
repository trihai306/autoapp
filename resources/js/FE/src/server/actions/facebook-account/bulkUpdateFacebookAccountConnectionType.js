'use server'

import { withAuthCheck } from '@/utils/withAuthCheck'
import { apiBulkUpdateFacebookAccountConnectionType } from '@/services/facebook-account/FacebookAccountService'

export default async function bulkUpdateFacebookAccountConnectionType(account_ids, connection_type) {
    return withAuthCheck(async () => {
        try {
            const response = await apiBulkUpdateFacebookAccountConnectionType(account_ids, connection_type)
            return { success: true, data: response }
        } catch (error) {
            console.error('Error bulk updating connection type:', error)
            return { success: false, message: error.response?.data?.message || 'Failed to bulk update connection type' }
        }
    })
}



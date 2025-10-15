'use server'

import { withAuthCheck } from '@/utils/withAuthCheck'
import { apiBulkRunFacebookAccountScenario } from '@/services/facebook-account/FacebookAccountService'

export default async function bulkRunFacebookAccountScenario(accountIds) {
    return withAuthCheck(async () => {
        try {
            const response = await apiBulkRunFacebookAccountScenario(accountIds)
            return {
                success: true,
                data: response.data || null,
                message: response.message || 'Bulk scenario started successfully'
            }
        } catch (error) {
            console.error('Error running bulk Facebook account scenario:', error)
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to run bulk scenario'
            }
        }
    })
}

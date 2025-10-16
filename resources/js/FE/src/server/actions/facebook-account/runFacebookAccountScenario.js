'use server'

import { withAuthCheck } from '@/utils/withAuthCheck'
import { apiRunFacebookAccountScenario } from '@/services/facebook-account/FacebookAccountService'

export default async function runFacebookAccountScenario(accountId, payload = {}) {
    return withAuthCheck(async () => {
        try {
            const response = await apiRunFacebookAccountScenario(accountId, payload)
            return {
                success: true,
                data: response.data || null,
                message: response.message || 'Scenario started successfully'
            }
        } catch (error) {
            console.error('Error running Facebook account scenario:', error)
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to run scenario'
            }
        }
    })
}

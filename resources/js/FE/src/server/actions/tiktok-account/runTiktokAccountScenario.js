'use server'

import { apiRunAccountScenario } from '@/services/tiktokAccount/TiktokAccountService'
import { withAuthCheck } from '@/utils/withAuthCheck'

export default async function runTiktokAccountScenario(accountId, data = {}) {
    return withAuthCheck(async () => {
        try {
            const resp = await apiRunAccountScenario(accountId, data)
            if (resp?.success === false) {
                return {
                    success: false,
                    message: resp?.message || 'Account scenario failed',
                    data: resp,
                }
            }
            return {
                success: true,
                data: resp,
            }
        } catch (error) {
            console.error('Error running account scenario:', error)
            const msg = error?.response?.data?.message || error?.message || 'Failed to run account scenario'
            return {
                success: false,
                message: msg,
            }
        }
    })
}


// resources/js/FE/src/server/actions/ai/getTiktokAccounts.js
'use server'

import { apiGetTiktokAccounts } from '@/services/ai/TiktokAccountService'
import { withAuthCheck } from '@/utils/withAuthCheck'

/**
 * Server Action to fetch TikTok accounts.
 */
export default async function getTiktokAccounts(params) {
    return withAuthCheck(async () => {
        try {
            const resp = await apiGetTiktokAccounts(params)
            return { success: true, data: resp }
        } catch (error) {
            console.error("Error fetching tiktok accounts:", error)
            return { success: false, message: "An unexpected error occurred." }
        }
    })
}

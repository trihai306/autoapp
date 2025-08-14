// resources/js/FE/src/server/actions/help/getSupportHubArticles.js
'use server'

import { apiGetSupportHubArticles } from '@/services/help/HelpCenterService'
import { withAuthCheck } from '@/utils/withAuthCheck'

/**
 * Server Action to fetch support hub articles.
 */
export default async function getSupportHubArticles(params) {
    return withAuthCheck(async () => {
        try {
            const resp = await apiGetSupportHubArticles(params)
            return { success: true, data: resp }
        } catch (error) {
            console.error("Error fetching support hub articles:", error)
            return { success: false, message: "An unexpected error occurred." }
        }
    })
}

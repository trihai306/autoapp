// resources/js/FE/src/server/actions/getAccountTasks.js
'use server'

import { apiGetAccountTasks } from '@/services/account/AccountTaskService'
import { withAuthCheck } from '@/utils/withAuthCheck'

/**
 * Server Action to fetch account tasks.
 * The core logic is wrapped with `withAuthCheck` to handle authentication errors centrally.
 */
export default async function getAccountTasks(params) {
    return withAuthCheck(async () => {
        try {
            const resp = await apiGetAccountTasks(params)
            return {
                success: true,
                list: resp.data || [],
                total: resp.total || 0,
            }
        } catch (error) {
            console.error("Error fetching account tasks:", error)
            return {
                success: false,
                message: "An unexpected error occurred while fetching account tasks.",
                list: [],
                total: 0,
            }
        }
    })
}

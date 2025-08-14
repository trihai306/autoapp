// resources/js/FE/src/server/actions/chat/getContactDetails.js
'use server'

import { apiGetContactDetails } from '@/services/chat/ChatService'
import { withAuthCheck } from '@/utils/withAuthCheck'

/**
 * Server Action to fetch contact details.
 */
export default async function getContactDetails(params) {
    return withAuthCheck(async () => {
        try {
            const resp = await apiGetContactDetails(params)
            return { success: true, data: resp }
        } catch (error) {
            console.error("Error fetching contact details:", error)
            return { success: false, message: "An unexpected error occurred." }
        }
    })
}

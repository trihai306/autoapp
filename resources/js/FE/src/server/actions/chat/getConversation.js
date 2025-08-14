// resources/js/FE/src/server/actions/chat/getConversation.js
'use server'

import { apiGetConversation } from '@/services/chat/ChatService'
import { withAuthCheck } from '@/utils/withAuthCheck'

/**
 * Server Action to fetch a conversation.
 */
export default async function getConversation(params) {
    return withAuthCheck(async () => {
        try {
            const resp = await apiGetConversation(params)
            return { success: true, data: resp }
        } catch (error) {
            console.error("Error fetching conversation:", error)
            return { success: false, message: "An unexpected error occurred." }
        }
    })
}

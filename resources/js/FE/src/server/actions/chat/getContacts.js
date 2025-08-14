// resources/js/FE/src/server/actions/chat/getContacts.js
'use server'

import { apiGetContacts } from '@/services/chat/ChatService'
import { withAuthCheck } from '@/utils/withAuthCheck'

/**
 * Server Action to fetch contacts.
 */
export default async function getContacts() {
    return withAuthCheck(async () => {
        try {
            const resp = await apiGetContacts()
            return { success: true, data: resp }
        } catch (error) {
            console.error("Error fetching contacts:", error)
            return { success: false, message: "An unexpected error occurred." }
        }
    })
}

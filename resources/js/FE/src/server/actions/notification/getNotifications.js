'use server'

import { apiGetNotifications } from '@/services/notification/NotificationService'
import { withAuthCheck } from '@/utils/withAuthCheck'

/**
 * Server Action to fetch notifications.
 * The core logic is wrapped with `withAuthCheck` to handle authentication errors centrally.
 */
export default async function getNotifications(params = {}) {
    return withAuthCheck(async () => {
        try {
            const resp = await apiGetNotifications(params)
            return {
                success: true,
                data: resp.data || [], // Ensure data is always an array
                total: resp.total || 0, // Ensure total is always a number
                loadable: resp.next_page_url ? true : false,
            }
        } catch (error) {
            console.error("Error fetching notifications:", error)
            return {
                success: false,
                message: "An unexpected error occurred while fetching notifications.",
                data: [],
                total: 0,
                loadable: false,
            }
        }
    })
}

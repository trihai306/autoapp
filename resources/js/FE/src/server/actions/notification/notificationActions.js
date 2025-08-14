// resources/js/FE/src/server/actions/notificationActions.js
'use server'

import { apiMarkAllNotificationsAsRead } from '@/services/notification/NotificationService'
import { revalidatePath } from 'next/cache'
import { withAuthCheck } from '@/utils/withAuthCheck'

export async function markAllAsReadAction() {
    return withAuthCheck(async () => {
        try {
            await apiMarkAllNotificationsAsRead()
            revalidatePath('/concepts/account/settings') // This needs to be inside the logic
            return { success: true }
        } catch (error) {
            console.error("Error marking all notifications as read:", error)
            return {
                success: false,
                message: "An unexpected error occurred."
            }
        }
    })
}

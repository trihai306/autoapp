// resources/js/FE/src/server/actions/notification/getNotifications.js
'use server'

import { apiGetNotifications } from '@/services/notification/NotificationService'
import { withAuthCheck } from '@/utils/withAuthCheck'
import { handleServerActionError } from '@/utils/serverActionErrorHandler'

/**
 * Server Action to fetch notifications.
 */
export default async function getNotifications(params) {
    return withAuthCheck(async () => {
        try {
            const resp = await apiGetNotifications(params)
            return { success: true, data: resp }
        } catch (error) {
            return handleServerActionError(error, "Failed to fetch notifications.")
        }
    })
}

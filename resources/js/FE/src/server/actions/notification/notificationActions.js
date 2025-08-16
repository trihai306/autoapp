// resources/js/FE/src/server/actions/notification/notificationActions.js
'use server'

import { 
    apiMarkNotificationAsRead, 
    apiMarkAllNotificationsAsRead,
    apiDeleteNotification,
    apiDeleteMultipleNotifications
} from '@/services/notification/NotificationService'
import { withAuthCheck } from '@/utils/withAuthCheck'

export async function markNotificationAsRead(id) {
    return withAuthCheck(async () => {
        try {
            const resp = await apiMarkNotificationAsRead(id)
            return {
                success: true,
                data: resp,
                message: 'Notification marked as read successfully.'
            }
        } catch (error) {
            console.error('Error marking notification as read:', error)
            return {
                success: false,
                message: 'Failed to mark notification as read.'
            }
        }
    })
}

export async function markAllNotificationsAsRead() {
    return withAuthCheck(async () => {
        try {
            const resp = await apiMarkAllNotificationsAsRead()
            return {
                success: true,
                data: resp,
                message: 'All notifications marked as read successfully.'
            }
        } catch (error) {
            console.error('Error marking all notifications as read:', error)
            return {
                success: false,
                message: 'Failed to mark all notifications as read.'
            }
        }
    })
}

export async function deleteNotification(id) {
    return withAuthCheck(async () => {
        try {
            const resp = await apiDeleteNotification(id)
            return {
                success: true,
                data: resp,
                message: 'Notification deleted successfully.'
            }
        } catch (error) {
            console.error('Error deleting notification:', error)
            return {
                success: false,
                message: 'Failed to delete notification.'
            }
        }
    })
}

export async function deleteMultipleNotifications(ids) {
    return withAuthCheck(async () => {
        try {
            const resp = await apiDeleteMultipleNotifications({ ids })
            return {
                success: true,
                data: resp,
                message: `${ids.length} notifications deleted successfully.`
            }
        } catch (error) {
            console.error('Error deleting multiple notifications:', error)
            return {
                success: false,
                message: 'Failed to delete notifications.'
            }
        }
    })
}

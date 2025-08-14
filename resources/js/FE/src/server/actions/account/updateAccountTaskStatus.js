// resources/js/FE/src/server/actions/updateAccountTaskStatus.js
'use server'

import { apiUpdateAccountTaskStatus } from '@/services/account/AccountTaskService'
import { withAuthCheck } from '@/utils/withAuthCheck'

/**
 * Server Action to update the status of an account task.
 * The core logic is wrapped with `withAuthCheck` to handle authentication errors centrally.
 */
export default async function updateAccountTaskStatus(taskId, status) {
    return withAuthCheck(async () => {
        try {
            await apiUpdateAccountTaskStatus(taskId, status)
            return {
                success: true,
                message: 'Task status updated successfully',
            }
        } catch (error) {
            console.error("Error updating account task status:", error)
            return {
                success: false,
                message: "An unexpected error occurred while updating task status."
            }
        }
    })
}

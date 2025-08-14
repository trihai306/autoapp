// resources/js/FE/src/server/actions/deleteAccountTasks.js
'use server'

import { apiDeleteAccountTask } from '@/services/account/AccountTaskService'
import { withAuthCheck } from '@/utils/withAuthCheck'

/**
 * Server Action to delete multiple account tasks.
 * The core logic is wrapped with `withAuthCheck` to handle authentication errors centrally.
 */
export default async function deleteAccountTasks(taskIds) {
    return withAuthCheck(async () => {
        try {
            // This is not optimal. It should be a single API call.
            // We will add a TODO to improve this later.
            const deletePromises = taskIds.map((id) =>
                apiDeleteAccountTask(id),
            )
            await Promise.all(deletePromises)

            return {
                success: true,
                message: 'Tasks deleted successfully',
            }
        } catch (error) {
            console.error("Error deleting account tasks:", error)
            return {
                success: false,
                message: "An unexpected error occurred while deleting tasks."
            }
        }
    })
}

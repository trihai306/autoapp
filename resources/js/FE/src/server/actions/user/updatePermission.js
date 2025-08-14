// resources/js/FE/src/server/actions/updatePermission.js
'use server'

import { apiUpdatePermission } from '@/services/user/PermissionsService'
import { withAuthCheck } from '@/utils/withAuthCheck'

/**
 * Server Action to update a permission.
 * The core logic is wrapped with `withAuthCheck` to handle authentication errors centrally.
 */
export default async function updatePermission(id, data) {
    return withAuthCheck(async () => {
        try {
            await apiUpdatePermission(id, data)
            return {
                success: true,
                message: 'Permission updated successfully',
            }
        } catch (error) {
            console.error("Error updating permission:", error)
            return {
                success: false,
                message: "An unexpected error occurred while updating permission.",
            }
        }
    })
}

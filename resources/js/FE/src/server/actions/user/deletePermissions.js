// resources/js/FE/src/server/actions/deletePermissions.js
'use server'

import { apiDeletePermissions } from '@/services/user/PermissionsService'
import { withAuthCheck } from '@/utils/withAuthCheck'

/**
 * Server Action to delete permissions.
 * The core logic is wrapped with `withAuthCheck` to handle authentication errors centrally.
 */
export default async function deletePermissions(ids) {
    return withAuthCheck(async () => {
        try {
            await apiDeletePermissions(ids)
            return {
                success: true,
                message: 'Permissions deleted successfully',
            }
        } catch (error) {
            console.error("Error deleting permissions:", error)
            return {
                success: false,
                message: "An unexpected error occurred while deleting permissions.",
            }
        }
    })
}

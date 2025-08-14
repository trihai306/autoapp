// resources/js/FE/src/server/actions/deleteRoles.js
'use server'

import { apiDeleteRoles } from '@/services/user/RolesService'
import { withAuthCheck } from '@/utils/withAuthCheck'

/**
 * Server Action to delete roles.
 * The core logic is wrapped with `withAuthCheck` to handle authentication errors centrally.
 */
export default async function deleteRoles(ids) {
    return withAuthCheck(async () => {
        try {
            await apiDeleteRoles(ids)
            return {
                success: true,
                message: 'Roles deleted successfully',
            }
        } catch (error) {
            console.error("Error deleting roles:", error)
            return {
                success: false,
                message: "An unexpected error occurred while deleting roles.",
            }
        }
    })
}

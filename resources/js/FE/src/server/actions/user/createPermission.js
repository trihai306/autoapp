// resources/js/FE/src/server/actions/createPermission.js
'use server'

import { apiCreatePermission } from '@/services/user/PermissionsService'
import { withAuthCheck } from '@/utils/withAuthCheck'

/**
 * Server Action to create a permission.
 * The core logic is wrapped with `withAuthCheck` to handle authentication errors centrally.
 */
export default async function createPermission(data) {
    return withAuthCheck(async () => {
        try {
            await apiCreatePermission(data)
            return {
                success: true,
                message: 'Permission created successfully',
            }
        } catch (error) {
            console.error("Error creating permission:", error)
            return {
                success: false,
                message: "An unexpected error occurred while creating permission.",
            }
        }
    })
}

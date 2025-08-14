// resources/js/FE/src/server/actions/getPermissions.js
'use server'

import { apiGetPermissions } from '@/services/user/PermissionsService'
import { withAuthCheck } from '@/utils/withAuthCheck'

/**
 * Server Action to fetch permissions.
 * The core logic is wrapped with `withAuthCheck` to handle authentication errors centrally.
 */
export default async function getPermissions(params) {
    return withAuthCheck(async () => {
        try {
            const resp = await apiGetPermissions(params)
            return {
                success: true,
                list: resp.data || [],
                total: resp.total || 0,
            }
        } catch (errors) {
            console.error("Error fetching permissions:", errors)
            return {
                success: false,
                message: "An unexpected error occurred while fetching permissions.",
                list: [],
                total: 0,
            }
        }
    })
}

// resources/js/FE/src/server/actions/getPermission.js
'use server'

import { apiGetPermission } from '@/services/user/PermissionsService'
import { withAuthCheck } from '@/utils/withAuthCheck'

/**
 * Server Action to fetch a single permission.
 * The core logic is wrapped with `withAuthCheck` to handle authentication errors centrally.
 */
export default async function getPermission(id) {
    return withAuthCheck(async () => {
        try {
            const resp = await apiGetPermission(id)
            return resp // Assuming the response is the permission object or null
        } catch (errors) {
            console.error("Error fetching permission:", errors)
            return null // Return null on other errors
        }
    })
}

// resources/js/FE/src/server/actions/getRoles.js
'use server'

import { apiGetRoles } from '@/services/user/RolesService'
import { withAuthCheck } from '@/utils/withAuthCheck'

/**
 * Server Action to fetch roles.
 * The core logic is wrapped with `withAuthCheck` to handle authentication errors centrally.
 */
export default async function getRoles(params) {
    return withAuthCheck(async () => {
        try {
            const resp = await apiGetRoles(params)
            return {
                success: true,
                list: resp.data || [],
                total: resp.total || 0,
            }
        } catch (errors) {
            console.error("Error fetching roles:", errors)
            return {
                success: false,
                message: "An unexpected error occurred while fetching roles.",
                list: [],
                total: 0,
            }
        }
    })
}

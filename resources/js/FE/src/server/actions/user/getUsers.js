// resources/js/FE/src/server/actions/getUsers.js
'use server'

import { apiGetUsers } from '@/services/user/UsersService'
import { withAuthCheck } from '@/utils/withAuthCheck'

/**
 * Server Action to fetch a paginated list of users.
 * The core logic is wrapped with `withAuthCheck` to handle authentication errors centrally.
 */
export default async function getUsers(params) {
    return withAuthCheck(async () => {
        try {
            const resp = await apiGetUsers(params)
            return {
                success: true,
                list: resp.data || [], // Ensure list is always an array
                total: resp.total || 0, // Ensure total is always a number
            }
        } catch (error) {
            console.error("Error fetching users:", error)
            return {
                success: false,
                message: "An unexpected error occurred while fetching users.",
                list: [],
                total: 0,
            }
        }
    })
}

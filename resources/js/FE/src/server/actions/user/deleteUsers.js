// resources/js/FE/src/server/actions/deleteUsers.js
'use server'

import { apiDeleteUsers } from '@/services/user/UsersService'
import { revalidatePath } from 'next/cache'
import { withAuthCheck } from '@/utils/withAuthCheck'

/**
 * Server Action to delete users.
 * The core logic is wrapped with `withAuthCheck` to handle authentication errors centrally.
 */
export default async function deleteUsers(userIds) {
    return withAuthCheck(async () => {
        try {
            await apiDeleteUsers({ ids: userIds })
            revalidatePath('/concepts/user-management')
            return {
                success: true,
                message: 'Users deleted successfully!',
            }
        } catch (errors) {
            console.error("Error deleting users:", errors)
            return {
                success: false,
                message: "An unexpected error occurred while deleting users.",
            }
        }
    })
}

// resources/js/FE/src/server/actions/blockUsers.js
'use server'

import { apiUpdateUserStatus } from '@/services/user/UsersService'
import { revalidatePath } from 'next/cache'
import { withAuthCheck } from '@/utils/withAuthCheck'

/**
 * Server Action to block users.
 * The core logic is wrapped with `withAuthCheck` to handle authentication errors centrally.
 */
export default async function blockUsers(userIds) {
    return withAuthCheck(async () => {
        try {
            await apiUpdateUserStatus({ ids: userIds, status: 'locked' })
            revalidatePath('/concepts/user-management')
            return {
                success: true,
                message: 'Users blocked successfully!',
            }
        } catch (errors) {
            console.error("Error blocking users:", errors)
            return {
                success: false,
                message: "An unexpected error occurred while blocking users.",
            }
        }
    })
}

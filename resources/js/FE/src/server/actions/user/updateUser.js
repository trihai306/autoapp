// resources/js/FE/src/server/actions/updateUser.js
'use server'

import { apiUpdateUser } from '@/services/user/UsersService'
import { revalidatePath } from 'next/cache'
import { withAuthCheck } from '@/utils/withAuthCheck'

/**
 * Server Action to update a user.
 * The core logic is wrapped with `withAuthCheck` to handle authentication errors centrally.
 */
export default async function updateUser(id, data) {
    return withAuthCheck(async () => {
        try {
            await apiUpdateUser(id, data)
            revalidatePath('/concepts/user-management')
            return {
                success: true,
                message: 'User updated successfully!',
            }
        } catch (errors) {
            console.error("Error updating user:", errors)
            return {
                success: false,
                message: "An unexpected error occurred while updating user.",
            }
        }
    })
}

// resources/js/FE/src/server/actions/createUser.js
'use server'

import { apiCreateUser } from '@/services/user/UsersService'
import { revalidatePath } from 'next/cache'
import { withAuthCheck } from '@/utils/withAuthCheck'

/**
 * Server Action to create a user.
 * The core logic is wrapped with `withAuthCheck` to handle authentication errors centrally.
 */
export default async function createUser(data) {
    return withAuthCheck(async () => {
        try {
            await apiCreateUser(data)
            revalidatePath('/concepts/user-management')
            return {
                success: true,
                message: 'User created successfully!',
            }
        } catch (errors) {
            console.error("Error creating user:", errors)
            return {
                success: false,
                message: "An unexpected error occurred while creating user.",
            }
        }
    })
}

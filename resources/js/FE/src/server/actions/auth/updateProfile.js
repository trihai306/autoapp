// resources/js/FE/src/server/actions/auth/updateProfile.js
'use server'

import { apiUpdateProfile } from '@/services/auth/AuthService'
import { withAuthCheck } from '@/utils/withAuthCheck'
import { revalidatePath } from 'next/cache'

/**
 * Server Action to update the current user's profile.
 */
export default async function updateProfile(data) {
    return withAuthCheck(async () => {
        try {
            const resp = await apiUpdateProfile(data)
            revalidatePath('/concepts/account/settings') // Revalidate to show updated info
            return { success: true, data: resp }
        } catch (error) {
            console.error("Error updating profile:", error)
            return { success: false, message: "An unexpected error occurred." }
        }
    })
}

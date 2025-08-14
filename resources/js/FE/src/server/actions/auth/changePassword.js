// resources/js/FE/src/server/actions/auth/changePassword.js
'use server'

import { apiChangePassword } from '@/services/auth/AuthService'
import { withAuthCheck } from '@/utils/withAuthCheck'

/**
 * Server Action to change the user's password.
 */
export default async function changePassword(data) {
    return withAuthCheck(async () => {
        try {
            const resp = await apiChangePassword(data)
            return { success: true, data: resp }
        } catch (error) {
            console.error("Error changing password:", error)
            // It's often better to return the specific error message from the API
            const message = error.response?.data?.message || "An unexpected error occurred."
            return { success: false, message: message }
        }
    })
}

// resources/js/FE/src/server/actions/auth/getProfile.js
'use server'

import { apiGetProfile } from '@/services/auth/AuthService'
import { withAuthCheck } from '@/utils/withAuthCheck'
import { handleServerActionError } from '@/utils/serverActionErrorHandler'

/**
 * Server Action to fetch the current user's profile.
 */
export default async function getProfile() {
    return withAuthCheck(async () => {
        try {
            const resp = await apiGetProfile()
            return { success: true, data: resp }
        } catch (error) {
            return handleServerActionError(error, "Failed to fetch profile.")
        }
    })
}

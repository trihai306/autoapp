// resources/js/FE/src/server/actions/account/getSettingsBilling.js
'use server'

import { apiGetSettingsBilling } from '@/services/account/AccountService'
import { withAuthCheck } from '@/utils/withAuthCheck'
import { handleServerActionError } from '@/utils/serverActionErrorHandler'

/**
 * Server Action to fetch billing settings.
 */
export default async function getSettingsBilling() {
    return withAuthCheck(async () => {
        try {
            const resp = await apiGetSettingsBilling()
            return { success: true, data: resp }
        } catch (error) {
            return handleServerActionError(error, "Failed to fetch billing settings.")
        }
    })
}

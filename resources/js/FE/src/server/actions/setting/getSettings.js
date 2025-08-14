// resources/js/FE/src/server/actions/setting/getSettings.js
'use server'

import { apiGetSettings } from '@/services/setting/SettingService'
import { withAuthCheck } from '@/utils/withAuthCheck'
import { handleServerActionError } from '@/utils/serverActionErrorHandler'

/**
 * Server Action to fetch settings.
 */
export default async function getSettings() {
    return withAuthCheck(async () => {
        try {
            const resp = await apiGetSettings()
            return { success: true, data: resp }
        } catch (error) {
            return handleServerActionError(error, "Failed to fetch settings.")
        }
    })
}

// resources/js/FE/src/server/actions/settingsActions.js
'use server'

import { apiUpdateSettings } from '@/services/setting/SettingService'
import { revalidatePath } from 'next/cache'
import { withAuthCheck } from '@/utils/withAuthCheck'

export async function updateSettingsAction(data) {
    return withAuthCheck(async () => {
        try {
            const response = await apiUpdateSettings(data)
            // Revalidate the settings page to see the changes immediately
            revalidatePath('/concepts/account/settings')
            return { success: true, data: response }
        } catch (error) {
            console.error("Error updating settings:", error)
            return { 
                success: false, 
                message: "An unexpected error occurred." 
            }
        }
    })
}

'use server'

import { apiDeleteDevice } from '@/services/device/DeviceService'
import { withAuthCheck } from '@/utils/withAuthCheck'
import { handleServerActionError } from '@/utils/serverActionErrorHandler'

export default async function deleteDevice(deviceId) {
    return withAuthCheck(async () => {
        try {

            const response = await apiDeleteDevice(deviceId)

            
            return {
                success: true,
                message: 'Device deleted successfully'
            }
        } catch (error) {
            console.error('❌ [deleteDevice] Error:', error)
            return handleServerActionError(error, 'Failed to delete device')
        }
    })
}

'use server'

import { apiDeleteDevices } from '@/services/device/DeviceService'
import { withAuthCheck } from '@/utils/withAuthCheck'
import { handleServerActionError } from '@/utils/serverActionErrorHandler'

export default async function deleteDevices(deviceIds) {
    return withAuthCheck(async () => {
        try {

            const response = await apiDeleteDevices({ ids: deviceIds })

            
            return {
                success: true,
                message: 'Devices deleted successfully'
            }
        } catch (error) {
            console.error('❌ [deleteDevices] Error:', error)
            return handleServerActionError(error, 'Failed to delete devices')
        }
    })
}
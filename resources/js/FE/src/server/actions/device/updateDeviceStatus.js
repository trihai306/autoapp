'use server'

import { apiUpdateDeviceStatus } from '@/services/device/DeviceService'
import { withAuthCheck } from '@/utils/withAuthCheck'
import { handleServerActionError } from '@/utils/serverActionErrorHandler'

export default async function updateDeviceStatus(ids, status) {
    return withAuthCheck(async () => {
        try {
            const response = await apiUpdateDeviceStatus({ ids, status })
            return {
                success: true,
                message: 'Device status updated successfully',
                data: response,
            }
        } catch (error) {
            return handleServerActionError(error, "An unexpected error occurred while updating device status.")
        }
    })
}

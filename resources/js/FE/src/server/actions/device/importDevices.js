'use server'

import { apiImportDevices } from '@/services/device/DeviceService'
import { withAuthCheck } from '@/utils/withAuthCheck'

export default async function importDevices(data) {
    return withAuthCheck(async () => {
        try {
            const response = await apiImportDevices(data)
            return {
                success: true,
                message: 'Devices imported successfully',
                data: response,
            }
        } catch (error) {
            console.error("Error importing devices:", error)
            
            // Handle validation errors
            if (error.response?.status === 422) {
                const validationErrors = error.response.data?.errors || {}
                const errorMessages = Object.values(validationErrors).flat()
                return {
                    success: false,
                    message: errorMessages.length > 0 ? errorMessages.join(', ') : 'Validation failed',
                    errors: validationErrors
                }
            }
            
            return {
                success: false,
                message: error.response?.data?.message || "An unexpected error occurred while importing devices.",
            }
        }
    })
}

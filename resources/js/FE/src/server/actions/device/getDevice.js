'use server'

import { apiGetDevice } from '@/services/device/DeviceService'
import { withAuthCheck } from '@/utils/withAuthCheck'

export default async function getDevice(id) {
    return withAuthCheck(async () => {
        try {
            const response = await apiGetDevice(id)
            
            return {
                success: true,
                data: response,
                message: 'Device retrieved successfully'
            }
        } catch (error) {
            console.error('Error fetching device:', error)
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to fetch device',
                data: null
            }
        }
    })
}

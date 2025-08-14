'use server'

import { apiGetDeviceRecentActivities } from '@/services/device/DeviceService'
import { withAuthCheck } from '@/utils/withAuthCheck'

export default async function getDeviceRecentActivities() {
    return withAuthCheck(async () => {
        try {
            const response = await apiGetDeviceRecentActivities()
            // console.log('Device recent activities:', response)
            return {
                success: true,
                data: response,
                message: 'Device recent activities retrieved successfully'
            }
        } catch (error) {
            console.error('Error fetching device recent activities:', error)
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to fetch device recent activities',
                data: []
            }
        }
    })
}

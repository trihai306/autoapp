'use server'

import { apiGetDeviceStats } from '@/services/device/DeviceService'
import { withAuthCheck } from '@/utils/withAuthCheck'

export default async function getDeviceStats() {
    return withAuthCheck(async () => {
        try {
            const response = await apiGetDeviceStats()
            
            return {
                success: true,
                data: response,
                message: 'Device statistics retrieved successfully'
            }
        } catch (error) {
            console.error('Error fetching device stats:', error)
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to fetch device statistics',
                data: null
            }
        }
    })
}

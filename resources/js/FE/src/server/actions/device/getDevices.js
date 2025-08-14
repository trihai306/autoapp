'use server'

import { apiGetDevices } from '@/services/device/DeviceService'
import { withAuthCheck } from '@/utils/withAuthCheck'
import { handleServerActionError } from '@/utils/serverActionErrorHandler'

export default async function getDevices(params = {}) {
    return withAuthCheck(async () => {
        try {
            const response = await apiGetDevices(params)
            const result = {
                success: true,
                data: response.data,
                pagination: response.pagination || null,
                total: response.total || 0,
                dataLength: response.data?.length || 0,
            }
            return result
        } catch (error) {
            console.error('❌ [getDevices] Error:', error)
            return handleServerActionError(error, 'Failed to fetch devices')
        }
    })
}

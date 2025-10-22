'use server'

import { withAuthCheck } from '@/utils/withAuthCheck'
import { apiUpdateTiktokAccountConnectionType } from '@/services/tiktokAccount/TiktokAccountService'

export default async function updateTiktokAccountConnectionType(id, connection_type) {
    return withAuthCheck(async () => {
        try {
            const response = await apiUpdateTiktokAccountConnectionType(id, connection_type)
            return { success: true, data: response }
        } catch (error) {
            console.error('Error updating connection type:', error)
            return { success: false, message: error.response?.data?.message || 'Failed to update connection type' }
        }
    })
}

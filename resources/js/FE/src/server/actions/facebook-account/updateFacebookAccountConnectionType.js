'use server'

import { withAuthCheck } from '@/utils/withAuthCheck'
import { apiUpdateFacebookAccountConnectionType } from '@/services/facebook-account/FacebookAccountService'

export default async function updateFacebookAccountConnectionType(id, connection_type) {
    return withAuthCheck(async () => {
        try {
            const response = await apiUpdateFacebookAccountConnectionType(id, connection_type)
            return { success: true, data: response }
        } catch (error) {
            console.error('Error updating connection type:', error)
            return { success: false, message: error.response?.data?.message || 'Failed to update connection type' }
        }
    })
}



'use server'

import { apiDeleteProxy } from '@/services/proxy/ProxyService'
import { withAuthCheck } from '@/utils/withAuthCheck'
import { handleServerActionError } from '@/utils/serverActionErrorHandler'

export default async function deleteProxy(proxyId) {
    return withAuthCheck(async () => {
        try {
            const response = await apiDeleteProxy(proxyId)
            
            return {
                success: true,
                message: 'Proxy deleted successfully'
            }
        } catch (error) {
            console.error('❌ [deleteProxy] Error:', error)
            return handleServerActionError(error, 'Failed to delete proxy')
        }
    })
}

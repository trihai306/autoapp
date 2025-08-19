'use server'

import { apiBulkDeleteProxies } from '@/services/proxy/ProxyService'
import { withAuthCheck } from '@/utils/withAuthCheck'
import { handleServerActionError } from '@/utils/serverActionErrorHandler'

export default async function deleteProxies(proxyIds) {
    return withAuthCheck(async () => {
        try {
            const response = await apiBulkDeleteProxies(proxyIds)
            
            return {
                success: true,
                message: 'Proxies deleted successfully'
            }
        } catch (error) {
            console.error('❌ [deleteProxies] Error:', error)
            return handleServerActionError(error, 'Failed to delete proxies')
        }
    })
}

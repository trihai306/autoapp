'use server'

import { apiGetProxies } from '@/services/proxy/ProxyService'
import { withAuthCheck } from '@/utils/withAuthCheck'
import { handleServerActionError } from '@/utils/serverActionErrorHandler'

export default async function getProxies(params = {}) {
    return withAuthCheck(async () => {
        try {
            const response = await apiGetProxies(params)
            const result = {
                success: true,
                data: response.data,
                pagination: response.pagination || null,
                total: response.total || 0,
                dataLength: response.data?.length || 0,
            }
            return result
        } catch (error) {
            console.error('❌ [getProxies] Error:', error)
            return handleServerActionError(error, 'Failed to fetch proxies')
        }
    })
}

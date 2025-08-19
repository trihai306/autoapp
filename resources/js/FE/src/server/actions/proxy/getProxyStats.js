'use server'

import { apiGetProxyStats } from '@/services/proxy/ProxyService'
import { withAuthCheck } from '@/utils/withAuthCheck'

export default async function getProxyStats(params = {}) {
    return withAuthCheck(async () => {
        try {
            const response = await apiGetProxyStats(params)
            
            return {
                success: true,
                data: response.data,
                message: 'Proxy statistics retrieved successfully'
            }
        } catch (error) {
            console.error('Error fetching proxy statistics:', error)
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to fetch proxy statistics',
                data: null
            }
        }
    })
}

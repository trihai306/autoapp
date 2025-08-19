'use server'

import { apiGetActiveProxies } from '@/services/proxy/ProxyService'
import { withAuthCheck } from '@/utils/withAuthCheck'

export default async function getActiveProxies() {
    return withAuthCheck(async () => {
        try {
            const response = await apiGetActiveProxies()
            
            return {
                success: true,
                data: response,
                message: 'Active proxies retrieved successfully'
            }
        } catch (error) {
            console.error('Error fetching active proxies:', error)
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to fetch active proxies',
                data: []
            }
        }
    })
}

'use server'

import { apiGetActiveProxiesForSelect } from '@/services/proxy/ProxyService'
import { withAuthCheck } from '@/utils/withAuthCheck'

export default async function getActiveProxies() {
    return withAuthCheck(async () => {
        try {
            const response = await apiGetActiveProxiesForSelect()
            
            return {
                success: true,
                data: response,
                message: 'Active proxies for select retrieved successfully'
            }
        } catch (error) {
            console.error('Error fetching active proxies for select:', error)
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to fetch active proxies for select',
                data: []
            }
        }
    })
}

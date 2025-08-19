'use server'

import { apiGetProxy } from '@/services/proxy/ProxyService'
import { withAuthCheck } from '@/utils/withAuthCheck'

export default async function getProxy(id) {
    return withAuthCheck(async () => {
        try {
            const response = await apiGetProxy(id)
            
            return {
                success: true,
                data: response,
                message: 'Proxy retrieved successfully'
            }
        } catch (error) {
            console.error('Error fetching proxy:', error)
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to fetch proxy',
                data: null
            }
        }
    })
}

'use server'

import { apiTestProxyConnection } from '@/services/proxy/ProxyService'
import { withAuthCheck } from '@/utils/withAuthCheck'

export default async function testProxyConnection(id) {
    return withAuthCheck(async () => {
        try {
            const response = await apiTestProxyConnection(id)

            return {
                success: true,
                data: response,
                message: 'Proxy connection test completed'
            }
        } catch (error) {
            console.error('Error testing proxy connection:', error)
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to test proxy connection',
                data: null
            }
        }
    })
}

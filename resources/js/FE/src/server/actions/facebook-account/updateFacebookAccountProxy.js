'use server'

import ApiService from '@/services/ApiService'
import { withAuthCheck } from '@/utils/withAuthCheck'

/**
 * Update proxy for a Facebook account (server action, requires auth)
 */
export default async function updateFacebookAccountProxy(accountId, proxyId) {
    console.log('🔍 [updateFacebookAccountProxy] Called with:', { accountId, proxyId })

    return withAuthCheck(async () => {
        try {
            console.log('🔍 [updateFacebookAccountProxy] Making API request to:', `/facebook-accounts/${accountId}`)
            console.log('🔍 [updateFacebookAccountProxy] Request data:', { proxy_id: proxyId || null })

            const res = await ApiService.fetchDataWithAxios({
                url: `/facebook-accounts/${accountId}`,
                method: 'patch',
                data: { proxy_id: proxyId || null },
            })

            console.log('🔍 [updateFacebookAccountProxy] API response:', res)
            return res
        } catch (error) {
            console.error('🔍 [updateFacebookAccountProxy] API error:', error)
            console.error('🔍 [updateFacebookAccountProxy] Error response:', error?.response?.data)

            return {
                success: false,
                message: error?.response?.data?.message || error?.message || 'Failed to update proxy',
            }
        }
    })
}



'use server'

import ApiService from '@/services/ApiService'
import { withAuthCheck } from '@/utils/withAuthCheck'

/**
 * Update proxy for a Facebook account (server action, requires auth)
 */
export default async function updateFacebookAccountProxy(accountId, proxyId) {
    return withAuthCheck(async () => {
        try {
            const res = await ApiService.fetchDataWithAxios({
                url: `/facebook-accounts/${accountId}`,
                method: 'patch',
                data: { proxy_id: proxyId || null },
            })
            return res
        } catch (error) {
            return {
                success: false,
                message: error?.response?.data?.message || error?.message || 'Failed to update proxy',
            }
        }
    })
}



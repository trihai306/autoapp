'use server'

import ApiService from '@/services/ApiService'
import { withAuthCheck } from '@/utils/withAuthCheck'

/**
 * Update proxy for a TikTok account (server action, requires auth)
 */
export default async function updateTiktokAccountProxy(accountId, proxyId) {
    return withAuthCheck(async () => {
        try {
            const res = await ApiService.fetchDataWithAxios({
                url: `/tiktok-accounts/${accountId}/update-proxy`,
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

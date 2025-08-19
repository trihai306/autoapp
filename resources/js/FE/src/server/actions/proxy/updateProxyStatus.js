'use server'

import { apiBulkUpdateProxyStatus } from '@/services/proxy/ProxyService'
import { withAuthCheck } from '@/utils/withAuthCheck'
import { handleServerActionError } from '@/utils/serverActionErrorHandler'

export default async function updateProxyStatus(ids, status) {
    return withAuthCheck(async () => {
        try {
            const response = await apiBulkUpdateProxyStatus(ids, status)
            return {
                success: true,
                message: 'Proxy status updated successfully',
                data: response,
            }
        } catch (error) {
            return handleServerActionError(error, "An unexpected error occurred while updating proxy status.")
        }
    })
}

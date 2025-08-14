// resources/js/FE/src/server/actions/transaction/getUserTransactions.js
'use server'

import TransactionService from '@/services/transaction/TransactionService'
import { withAuthCheck } from '@/utils/withAuthCheck'
import { handleServerActionError } from '@/utils/serverActionErrorHandler'

/**
 * Server Action to fetch user's transactions for billing/settings page.
 * This uses the /my-transactions endpoint to get current user's transaction history.
 */
export default async function getUserTransactions(params) {
    return withAuthCheck(async () => {
        try {
            const resp = await TransactionService.getUserTransactions(params)
            return {
                success: true,
                data: resp.data || [],
                total: resp.total || 0,
                meta: resp.meta || {},
            }
        } catch (errors) {
            const errorResult = handleServerActionError(errors, "Failed to fetch user transactions.")
            return {
                ...errorResult,
                data: [],
                total: 0,
                meta: {},
            }
        }
    })
}

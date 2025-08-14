// resources/js/FE/src/server/actions/getTransactions.js
'use server'

import TransactionService from '@/services/transaction/TransactionService'
import { withAuthCheck } from '@/utils/withAuthCheck'

/**
 * Server Action to fetch transactions.
 * The core logic is wrapped with `withAuthCheck` to handle authentication errors centrally.
 */
export default async function getTransactions(params) {
    return withAuthCheck(async () => {
        try {
            const resp = await TransactionService.getTransactions(params)
            return {
                success: true,
                list: resp.data || [],
                total: resp.total || 0,
            }
        } catch (errors) {
            console.error("Error fetching transactions:", errors)
            return {
                success: false,
                message: "An unexpected error occurred while fetching transactions.",
                list: [],
                total: 0,
            }
        }
    })
}

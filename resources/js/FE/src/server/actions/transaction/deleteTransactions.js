// resources/js/FE/src/server/actions/deleteTransactions.js
'use server'

import TransactionService from '@/services/transaction/TransactionService'
import { revalidatePath } from 'next/cache'
import { withAuthCheck } from '@/utils/withAuthCheck'

/**
 * Server Action to delete transactions.
 * The core logic is wrapped with `withAuthCheck` to handle authentication errors centrally.
 */
export default async function deleteTransactions(transactionIds) {
    return withAuthCheck(async () => {
        try {
            await TransactionService.deleteTransactions({ ids: transactionIds })
            revalidatePath('/concepts/transaction-management')
            return {
                success: true,
                message: 'Transactions deleted successfully!',
            }
        } catch (errors) {
            console.error("Error deleting transactions:", errors)
            return {
                success: false,
                message: "An unexpected error occurred while deleting transactions.",
            }
        }
    })
}

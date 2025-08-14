// resources/js/FE/src/server/actions/updateTransactionStatus.js
'use server'

import { revalidatePath } from 'next/cache'
import TransactionService from '@/services/transaction/TransactionService'
import { withAuthCheck } from '@/utils/withAuthCheck'

/**
 * Server Action to update transaction status (approve/reject).
 * The core logic is wrapped with `withAuthCheck` to handle authentication errors centrally.
 */
export default async function updateTransactionStatus(transactionId, status) {
    return withAuthCheck(async () => {
        try {
            let response;
            if (status === 'approve') {
                response = await TransactionService.approveTransaction(transactionId);
            } else if (status === 'reject') {
                response = await TransactionService.rejectTransaction(transactionId);
            } else {
                throw new Error('Invalid status provided.');
            }

            revalidatePath('/concepts/transaction-management')
            return {
                success: true,
                message: `Transaction successfully ${status === 'approve' ? 'approved' : 'rejected'}.`,
                data: response.data
            }
        } catch (error) {
            console.error("Error updating transaction status:", error)
            return {
                success: false,
                message: "An unexpected error occurred while updating transaction status."
            }
        }
    })
}

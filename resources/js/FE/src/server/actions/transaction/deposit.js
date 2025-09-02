'use server'

import TransactionService from '@/services/transaction/TransactionService'
import { withAuthCheck } from '@/utils/withAuthCheck'
import { handleServerActionError } from '@/utils/serverActionErrorHandler'

/**
 * Server Action: Thực hiện cộng tiền (sau khi đã xác minh thanh toán)
 * Input: { amount: number, note?: string }
 * Output: { success, data, message }
 */
export default async function deposit(data) {
    return withAuthCheck(async () => {
        try {
            if (!data || !Number(data.amount) || Number(data.amount) < 1000) {
                return {
                    success: false,
                    message: 'Số tiền nạp không hợp lệ (>= 1,000)',
                }
            }

            const resp = await TransactionService.deposit({
                amount: Number(data.amount),
                note: data.note || '',
            })

            return {
                success: true,
                data: resp,
            }
        } catch (error) {
            return handleServerActionError(error, 'Nạp tiền thất bại')
        }
    })
}



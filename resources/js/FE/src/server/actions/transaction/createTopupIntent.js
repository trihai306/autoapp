'use server'

import TransactionService from '@/services/transaction/TransactionService'
import { withAuthCheck } from '@/utils/withAuthCheck'
import { handleServerActionError } from '@/utils/serverActionErrorHandler'

/**
 * Server Action: Tạo topup intent để lấy qr_text và thông tin chuyển khoản
 * Input: { amount: number, note?: string }
 * Output: { success, data, message }
 */
export default async function createTopupIntent(data) {
    return withAuthCheck(async () => {
        try {
            if (!data || !Number(data.amount) || Number(data.amount) < 1000) {
                return {
                    success: false,
                    message: 'Số tiền nạp không hợp lệ (>= 1,000)',
                }
            }

            const resp = await TransactionService.createTopupIntent({
                amount: Number(data.amount),
                note: data.note || '',
            })

            return {
                success: true,
                data: resp,
            }
        } catch (error) {
            return handleServerActionError(error, 'Tạo yêu cầu nạp thất bại')
        }
    })
}



'use server'

import { apiUpdateTiktokAccount } from '@/services/tiktok-account/TiktokAccountService'
import { revalidatePath } from 'next/cache'
import { withAuthCheck } from '@/utils/withAuthCheck'
import { handleServerActionError } from '@/utils/serverActionErrorHandler'

export default async function updateTiktokAccount(id, data) {
    return withAuthCheck(async () => {
        try {
            const response = await apiUpdateTiktokAccount(id, data)
            revalidatePath('/concepts/tiktok-account-management')
            
            return {
                success: true,
                data: response.data,
                message: 'Tiktok account updated successfully'
            }
        } catch (error) {
            return handleServerActionError(error, 'Failed to update tiktok account')
        }
    })
} 
'use server'

import { apiCreateTiktokAccount } from '@/services/tiktok-account/TiktokAccountService'
import { revalidatePath } from 'next/cache'
import { withAuthCheck } from '@/utils/withAuthCheck'
import { handleServerActionError } from '@/utils/serverActionErrorHandler'

export default async function createTiktokAccount(data) {
    return withAuthCheck(async () => {
        try {
            const response = await apiCreateTiktokAccount(data)
            revalidatePath('/concepts/tiktok-account-management')
            
            return {
                success: true,
                data: response.data,
                message: 'Tiktok account created successfully'
            }
        } catch (error) {
            return handleServerActionError(error, 'Failed to create tiktok account')
        }
    })
} 
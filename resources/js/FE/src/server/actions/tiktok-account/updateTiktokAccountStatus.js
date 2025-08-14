'use server'

import { apiUpdateTiktokAccountStatus } from '@/services/tiktok-account/TiktokAccountService'
import { revalidatePath } from 'next/cache'
import { withAuthCheck } from '@/utils/withAuthCheck'

export default async function updateTiktokAccountStatus(ids, status) {
    return withAuthCheck(async () => {
        try {
            const response = await apiUpdateTiktokAccountStatus({ ids, status })
            revalidatePath('/concepts/tiktok-account-management')
            
            return {
                success: true,
                message: response.message || 'Tiktok accounts status updated successfully'
            }
        } catch (error) {
            console.error('Error updating tiktok accounts status:', error)
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to update tiktok accounts status'
            }
        }
    })
} 
'use server'

import { apiDeleteTiktokAccounts } from '@/services/tiktok-account/TiktokAccountService'
import { revalidatePath } from 'next/cache'
import { withAuthCheck } from '@/utils/withAuthCheck'

export default async function deleteTiktokAccounts(ids) {
    return withAuthCheck(async () => {
        try {
            const response = await apiDeleteTiktokAccounts({ ids })
            revalidatePath('/concepts/tiktok-account-management')
            
            return {
                success: true,
                message: response.message || 'Tiktok accounts deleted successfully'
            }
        } catch (error) {
            console.error('Error deleting tiktok accounts:', error)
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to delete tiktok accounts'
            }
        }
    })
} 
'use server'
import { withAuthCheck } from '@/utils/withAuthCheck'
import { apiGetAllFacebookAccountTasks } from '@/services/facebook-account/FacebookAccountService'

export default async function getAllFacebookAccountTasks(params = {}) {
    return withAuthCheck(async () => {
        try {
            const response = await apiGetAllFacebookAccountTasks(params)
            return {
                success: true,
                data: response.data || null,
                message: 'All Facebook account tasks retrieved successfully'
            }
        } catch (error) {
            console.error('Error fetching all Facebook account tasks:', error)
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to fetch all tasks'
            }
        }
    })
}

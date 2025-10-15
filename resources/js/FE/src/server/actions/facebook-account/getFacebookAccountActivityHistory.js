'use server'

import { withAuthCheck } from '@/utils/withAuthCheck'
import ApiService from '@/services/ApiService'

export default async function getFacebookAccountActivityHistory(id, params = {}) {
    return withAuthCheck(async () => {
        try {
            const response = await ApiService.fetchDataWithAxios({
                url: `/facebook-accounts/${id}/activities`,
                method: 'get',
                params,
            })
            return { success: true, data: response.data || { activities: [], pagination: null } }
        } catch (error) {
            console.error('Error fetching facebook activity history:', error)
            return { success: false, message: error.response?.data?.message || 'Failed to fetch activity history' }
        }
    })
}



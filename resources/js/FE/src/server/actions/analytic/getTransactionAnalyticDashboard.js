'use server'
import ApiService from '@/services/ApiService'
import { withAuthCheck } from '@/utils/withAuthCheck'

/**
 * Server Action to fetch transaction analytic dashboard data.
 * The core logic is wrapped with `withAuthCheck` to handle authentication errors centrally.
 */
export default async function getTransactionAnalyticDashboard() {
    return withAuthCheck(async () => {
        try {
            const response = await ApiService.fetchDataWithAxios({
                url: '/analytic/transactions',
                method: 'get',
            })
            // Assuming the successful response is the data itself
            return { success: true, data: response }
        } catch (error) {
            console.error('Error fetching transaction analytic dashboard data:', error)
            return { success: false, message: 'Failed to fetch transaction analytic data.' }
        }
    })
}

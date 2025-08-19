// resources/js/FE/src/server/actions/getAccountTasks.js
'use server'

import { apiGetAccountTasks } from '@/services/account/AccountTaskService'
import { withAuthCheck } from '@/utils/withAuthCheck'

/**
 * Server Action to fetch account tasks.
 * The core logic is wrapped with `withAuthCheck` to handle authentication errors centrally.
 */
export default async function getAccountTasks(params) {
    return withAuthCheck(async () => {
        try {
            // Xử lý tham số filter và sort
            const apiParams = { ...params }
            
            // Chuyển đổi filter[status] thành status nếu cần
            if (apiParams['filter[status]'] !== undefined) {
                apiParams.status = apiParams['filter[status]']
                delete apiParams['filter[status]']
            }
            
            console.log('🚀 getAccountTasks - API Params:', apiParams)
            
            const resp = await apiGetAccountTasks(apiParams)
            
            console.log('📡 getAccountTasks - API Response:', resp)
            console.log('📊 getAccountTasks - Response Data:', resp.data)
            console.log('📊 getAccountTasks - Response Total:', resp.total)
            
            return {
                success: true,
                list: resp.data || [],
                total: resp.total || 0,
            }
        } catch (error) {
            console.error("❌ Error fetching account tasks:", error)
            return {
                success: false,
                message: "An unexpected error occurred while fetching account tasks.",
                list: [],
                total: 0,
            }
        }
    })
}

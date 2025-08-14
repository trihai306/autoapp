// resources/js/FE/src/server/actions/customer/getCustomerLog.js
'use server'

import { apiGetCustomerLog } from '@/services/customer/CustomersService'
import { withAuthCheck } from '@/utils/withAuthCheck'

/**
 * Server Action to fetch customer logs.
 */
export default async function getCustomerLog(params) {
    return withAuthCheck(async () => {
        try {
            const resp = await apiGetCustomerLog(params)
            return { success: true, data: resp }
        } catch (error) {
            console.error("Error fetching customer log:", error)
            return { success: false, message: "An unexpected error occurred." }
        }
    })
}

// resources/js/FE/src/server/actions/getLogs.jsx
'use server'

import { apiGetLogs } from '@/services/log/LogService'
import { withAuthCheck } from '@/utils/withAuthCheck'

/**
 * Server Action to fetch logs.
 * The core logic is wrapped with `withAuthCheck` to handle authentication errors centrally.
 */
async function getLogs(activityIndex = 1, filter) {
    return withAuthCheck(async () => {
        try {
            const response = await apiGetLogs({ activityIndex, filter })
            return response
        } catch (error) {
            console.error('Error fetching logs:', error)
            return { data: [], loadable: false }
        }
    })
}

export default getLogs

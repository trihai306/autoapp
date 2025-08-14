// resources/js/FE/src/server/actions/project/getProjectMembers.js
'use server'

import { apiGetProjectMembers } from '@/services/project/ProjectService'
import { withAuthCheck } from '@/utils/withAuthCheck'

/**
 * Server Action to fetch project members.
 */
export default async function getProjectMembers(params) {
    return withAuthCheck(async () => {
        try {
            const resp = await apiGetProjectMembers(params)
            return { success: true, data: resp }
        } catch (error) {
            console.error("Error fetching project members:", error)
            return { success: false, message: "An unexpected error occurred." }
        }
    })
}

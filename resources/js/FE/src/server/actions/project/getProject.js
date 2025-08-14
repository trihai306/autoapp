// resources/js/FE/srcs/erver/actions/project/getProject.js
'use server'

import { apiGetProject } from '@/services/project/ProjectService'
import { withAuthCheck } from '@/utils/withAuthCheck'

/**
 * Server Action to fetch a single project.
 */
export default async function getProject(id) {
    return withAuthCheck(async () => {
        try {
            const resp = await apiGetProject(id)
            return { success: true, data: resp }
        } catch (error) {
            console.error(`Error fetching project ${id}:`, error)
            return { success: false, message: "An unexpected error occurred." }
        }
    })
}

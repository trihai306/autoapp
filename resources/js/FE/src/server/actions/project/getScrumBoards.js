// resources/js/FE/src/server/actions/project/getScrumBoards.js
'use server'

import { apiGetScrumBoards } from '@/services/project/ProjectService'
import { withAuthCheck } from '@/utils/withAuthCheck'

/**
 * Server Action to fetch scrum boards.
 */
export default async function getScrumBoards(params) {
    return withAuthCheck(async () => {
        try {
            const resp = await apiGetScrumBoards(params)
            return { success: true, data: resp }
        } catch (error) {
            console.error("Error fetching scrum boards:", error)
            return { success: false, message: "An unexpected error occurred." }
        }
    })
}

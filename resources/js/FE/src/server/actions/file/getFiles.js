// resources/js/FE/src/server/actions/file/getFiles.js
'use server'

import { apiGetFiles } from '@/services/file/FileService'
import { withAuthCheck } from '@/utils/withAuthCheck'

/**
 * Server Action to fetch files.
 */
export default async function getFiles(params) {
    return withAuthCheck(async () => {
        try {
            const resp = await apiGetFiles(params)
            return { success: true, data: resp }
        } catch (error) {
            console.error("Error fetching files:", error)
            return { success: false, message: "An unexpected error occurred." }
        }
    })
}

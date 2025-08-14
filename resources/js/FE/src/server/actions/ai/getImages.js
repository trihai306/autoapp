// resources/js/FE/src/server/actions/ai/getImages.js
'use server'

import { apiGetImages } from '@/services/ai/AiService'
import { withAuthCheck } from '@/utils/withAuthCheck'

/**
 * Server Action to fetch generated images.
 */
export default async function getImages(params) {
    return withAuthCheck(async () => {
        try {
            const resp = await apiGetImages(params)
            return { success: true, data: resp }
        } catch (error) {
            console.error("Error fetching images:", error)
            return { success: false, message: "An unexpected error occurred." }
        }
    })
}

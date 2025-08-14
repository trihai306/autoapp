// resources/js/FE/src/server/actions/ai/postImages.js
'use server'

import { apiPostImages } from '@/services/ai/AiService'
import { withAuthCheck } from '@/utils/withAuthCheck'

/**
 * Server Action to post a request for image generation.
 */
export default async function postImages(data) {
    return withAuthCheck(async () => {
        try {
            const resp = await apiPostImages(data)
            return { success: true, data: resp }
        } catch (error) {
            console.error("Error posting images:", error)
            return { success: false, message: "An unexpected error occurred." }
        }
    })
}

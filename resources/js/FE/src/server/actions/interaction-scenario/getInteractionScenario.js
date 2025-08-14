// resources/js/FE/src/server/actions/interaction-scenario/getInteractionScenario.js
'use server'

import InteractionScenarioService from '@/services/interaction-scenario/InteractionScenarioService'
import { withAuthCheck } from '@/utils/withAuthCheck'

/**
 * Server Action to fetch a single interaction scenario with its scripts.
 * The core logic is wrapped with `withAuthCheck` to handle authentication errors centrally.
 */
export default async function getInteractionScenario(id) {
    return withAuthCheck(async () => {
        try {
            const resp = await InteractionScenarioService.getInteractionScenario(id)
            return {
                success: true,
                data: resp,
            }
        } catch (error) {
            console.error("Error fetching interaction scenario:", error)
            
            // Handle authorization errors
            if (error?.response?.status === 403) {
                return {
                    success: false,
                    message: "You don't have permission to view this interaction scenario."
                }
            }
            
            // Handle not found errors
            if (error?.response?.status === 404) {
                return {
                    success: false,
                    message: "Interaction scenario not found."
                }
            }
            
            return {
                success: false,
                message: "An unexpected error occurred while fetching the interaction scenario."
            }
        }
    })
}

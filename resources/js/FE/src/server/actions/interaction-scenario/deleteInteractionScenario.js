// resources/js/FE/src/server/actions/interaction-scenario/deleteInteractionScenario.js
'use server'

import InteractionScenarioService from '@/services/interaction-scenario/InteractionScenarioService'
import { withAuthCheck } from '@/utils/withAuthCheck'

/**
 * Server Action to delete an interaction scenario.
 * The core logic is wrapped with `withAuthCheck` to handle authentication errors centrally.
 */
export default async function deleteInteractionScenario(id) {
    return withAuthCheck(async () => {
        try {
            await InteractionScenarioService.deleteInteractionScenario(id)
            return {
                success: true,
                message: "Interaction scenario deleted successfully."
            }
        } catch (error) {
            console.error("Error deleting interaction scenario:", error)
            
            // Handle authorization errors
            if (error?.response?.status === 403) {
                return {
                    success: false,
                    message: "You don't have permission to delete this interaction scenario."
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
                message: "An unexpected error occurred while deleting the interaction scenario."
            }
        }
    })
}

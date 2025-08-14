// resources/js/FE/src/server/actions/interaction-scenario/updateInteractionScenario.js
'use server'

import InteractionScenarioService from '@/services/interaction-scenario/InteractionScenarioService'
import { withAuthCheck } from '@/utils/withAuthCheck'

/**
 * Server Action to update an interaction scenario.
 * The core logic is wrapped with `withAuthCheck` to handle authentication errors centrally.
 */
export default async function updateInteractionScenario(id, data) {
    return withAuthCheck(async () => {
        try {
            const resp = await InteractionScenarioService.updateInteractionScenario(id, data)
            return {
                success: true,
                data: resp,
                message: "Interaction scenario updated successfully."
            }
        } catch (error) {
            console.error("Error updating interaction scenario:", error)
            
            // Handle validation errors
            if (error?.response?.status === 422) {
                console.error("Validation errors:", error.response.data)
                return {
                    success: false,
                    message: "Validation failed.",
                    errors: error.response.data.errors || {},
                    details: error.response.data
                }
            }
            
            // Handle authorization errors
            if (error?.response?.status === 403) {
                return {
                    success: false,
                    message: "You don't have permission to update this interaction scenario."
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
                message: "An unexpected error occurred while updating the interaction scenario."
            }
        }
    })
}

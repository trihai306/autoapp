// resources/js/FE/src/server/actions/interaction-scenario/createInteractionScenario.js
'use server'

import InteractionScenarioService from '@/services/interaction-scenario/InteractionScenarioService'
import { apiGetProfile } from '@/services/auth/AuthService'
import { withAuthCheck } from '@/utils/withAuthCheck'

/**
 * Server Action to create a new interaction scenario.
 * The core logic is wrapped with `withAuthCheck` to handle authentication errors centrally.
 */
export default async function createInteractionScenario(data) {
    return withAuthCheck(async () => {
        try {
            // Get current user profile to get user_id
            const profile = await apiGetProfile()
            
            if (!profile || !profile.id) {
                return {
                    success: false,
                    message: "Unable to get current user information."
                }
            }
            

            
            // Add user_id to the data
            const scenarioData = {
                ...data,
                user_id: profile.id
            }
            

            
            const resp = await InteractionScenarioService.createInteractionScenario(scenarioData)
            return {
                success: true,
                data: resp,
                message: "Interaction scenario created successfully."
            }
        } catch (error) {
            console.error("Error creating interaction scenario:", error)
            
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
                    message: "You don't have permission to create interaction scenarios."
                }
            }
            
            return {
                success: false,
                message: "An unexpected error occurred while creating the interaction scenario."
            }
        }
    })
}

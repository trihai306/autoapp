// resources/js/FE/src/server/actions/scenario-script/createScenarioScript.js
'use server'

import ScenarioScriptService from '@/services/scenario-script/ScenarioScriptService'
import { withAuthCheck } from '@/utils/withAuthCheck'

/**
 * Server Action to create a new scenario script.
 * The core logic is wrapped with `withAuthCheck` to handle authentication errors centrally.
 */
export default async function createScenarioScript(data) {
    return withAuthCheck(async () => {
        try {
            const resp = await ScenarioScriptService.createScenarioScript(data)
            return {
                success: true,
                data: resp,
                message: "Scenario script created successfully."
            }
        } catch (error) {
            console.error("Error creating scenario script:", error)
            
            // Handle validation errors
            if (error?.response?.status === 422) {
                return {
                    success: false,
                    message: "Validation failed.",
                    errors: error.response.data.errors || {}
                }
            }
            
            return {
                success: false,
                message: "An unexpected error occurred while creating the scenario script."
            }
        }
    })
}

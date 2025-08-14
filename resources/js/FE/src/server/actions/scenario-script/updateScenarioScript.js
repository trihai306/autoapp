// resources/js/FE/src/server/actions/scenario-script/updateScenarioScript.js
'use server'

import ScenarioScriptService from '@/services/scenario-script/ScenarioScriptService'
import { withAuthCheck } from '@/utils/withAuthCheck'

/**
 * Server Action to update a scenario script.
 * The core logic is wrapped with `withAuthCheck` to handle authentication errors centrally.
 */
export default async function updateScenarioScript(id, data) {
    return withAuthCheck(async () => {
        try {
            const resp = await ScenarioScriptService.updateScenarioScript(id, data)
            return {
                success: true,
                data: resp,
                message: "Scenario script updated successfully."
            }
        } catch (error) {
            console.error("Error updating scenario script:", error)
            
            // Handle validation errors
            if (error?.response?.status === 422) {
                return {
                    success: false,
                    message: "Validation failed.",
                    errors: error.response.data.errors || {}
                }
            }
            
            // Handle not found errors
            if (error?.response?.status === 404) {
                return {
                    success: false,
                    message: "Scenario script not found."
                }
            }
            
            return {
                success: false,
                message: "An unexpected error occurred while updating the scenario script."
            }
        }
    })
}

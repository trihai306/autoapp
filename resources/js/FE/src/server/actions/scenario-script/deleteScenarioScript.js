// resources/js/FE/src/server/actions/scenario-script/deleteScenarioScript.js
'use server'

import ScenarioScriptService from '@/services/scenario-script/ScenarioScriptService'
import { withAuthCheck } from '@/utils/withAuthCheck'

/**
 * Server Action to delete a scenario script.
 * The core logic is wrapped with `withAuthCheck` to handle authentication errors centrally.
 */
export default async function deleteScenarioScript(id) {
    return withAuthCheck(async () => {
        try {
            await ScenarioScriptService.deleteScenarioScript(id)
            return {
                success: true,
                message: "Scenario script deleted successfully."
            }
        } catch (error) {
            console.error("Error deleting scenario script:", error)
            
            // Handle not found errors
            if (error?.response?.status === 404) {
                return {
                    success: false,
                    message: "Scenario script not found."
                }
            }
            
            return {
                success: false,
                message: "An unexpected error occurred while deleting the scenario script."
            }
        }
    })
}

'use server'

import InteractionScenarioService from '@/services/interaction-scenario/InteractionScenarioService'
import { withAuthCheck } from '@/utils/withAuthCheck'

export default async function getInteractionScenarios(params = {}) {
    return withAuthCheck(async () => {
        try {
            const resp = await InteractionScenarioService.getInteractionScenarios(params)
            return resp.data
        } catch (error) {
            return { success: false, message: error?.response?.data?.message || error.message }
        }
    })
}

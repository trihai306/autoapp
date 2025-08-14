'use server'

import InteractionScenarioService from '@/services/interaction-scenario/InteractionScenarioService'
import { withAuthCheck } from '@/utils/withAuthCheck'
import { handleServerActionError } from '@/utils/serverActionErrorHandler'

export default async function getInteractionScenarios(params = {}) {
    return withAuthCheck(async () => {
        try {
            const response = await InteractionScenarioService.getInteractionScenarios(params)
            return {
                success: true,
                data: response.data,
                pagination: response.pagination || null,
                total: response.total || 0
            }
        } catch (error) {
            return handleServerActionError(error, 'Failed to fetch interaction scenarios')
        }
    })
}

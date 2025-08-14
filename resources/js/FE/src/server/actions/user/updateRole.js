// resources/js/FE/src/server/actions/updateRole.js
'use server'

import { apiUpdateRole } from '@/services/user/RolesService'
import { withAuthCheck } from '@/utils/withAuthCheck'
import { handleServerActionError } from '@/utils/serverActionErrorHandler'

/**
 * Server Action to update a role.
 * The core logic is wrapped with `withAuthCheck` to handle authentication errors centrally.
 */
export default async function updateRole(id, data) {
    return withAuthCheck(async () => {
        try {
            const response = await apiUpdateRole(id, data)
            return {
                success: true,
                message: 'Role updated successfully',
                data: response.data,
            }
        } catch (error) {
            // Handle validation errors before using handleServerActionError
            if (error.response?.status === 422) {
                const validationErrors = error.response.data?.errors || {}
                const errorMessages = Object.values(validationErrors).flat()
                return {
                    success: false,
                    message: errorMessages.length > 0 ? errorMessages.join(', ') : 'Validation failed',
                    errors: validationErrors
                }
            }
            
            return handleServerActionError(error, "An unexpected error occurred while updating role.")
        }
    })
}

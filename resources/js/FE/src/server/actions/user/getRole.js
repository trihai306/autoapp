'use server'

import { withAuthCheck } from '@/utils/withAuthCheck'
import ApiService from '@/services/ApiService'

/**
 * Server Action to fetch a single role.
 * The core logic is wrapped with `withAuthCheck` to handle authentication errors centrally.
 */
export default async function getRole(roleId) {
    return withAuthCheck(async () => {
        try {
            const response = await ApiService.fetchDataWithAxios({
                method: 'GET',
                url: `/roles/${roleId}`,
            })
            
            return {
                success: true,
                data: response,
                message: 'Role retrieved successfully'
            }
        } catch (error) {
            console.error('Error in getRole:', error)
            return {
                success: false,
                message: 'An error occurred while retrieving the role',
                status: 500
            }
        }
    })
}

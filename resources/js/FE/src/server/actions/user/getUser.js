// resources/js/FE/src/server/actions/getUser.js
'use server'

import { apiGetUser } from '@/services/user/UsersService'
import { withAuthCheck } from '@/utils/withAuthCheck'

/**
 * Server Action to fetch a single user.
 * The core logic is wrapped with `withAuthCheck` to handle authentication errors centrally.
 */
export default async function getUser(id) {
    return withAuthCheck(async () => {
        try {

            const resp = await apiGetUser(id)

            return resp // Assuming the response is the user object or null
        } catch (errors) {
            console.error('Error in getUser:', errors)
            return null
        }
    })
}

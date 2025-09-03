'use server'

import { apiSearchServicePackages } from '@/services/service-package/ServicePackageService'
import { withAuthCheck } from '@/utils/withAuthCheck'
import { handleServerActionError } from '@/utils/serverActionErrorHandler'

/**
 * Server Action to search service packages.
 * The core logic is wrapped with `withAuthCheck` to handle authentication errors centrally.
 */
export default async function searchServicePackages(query, params = {}) {
    return withAuthCheck(async () => {
        try {
            if (!query || !query.trim()) {
                return {
                    success: false,
                    message: 'Từ khóa tìm kiếm không được để trống'
                }
            }

            const response = await apiSearchServicePackages(query, params)
            
            return {
                success: true,
                data: response.data || [],
                pagination: response.pagination || null,
                total: response.total || 0,
                message: `Tìm thấy ${response.total || 0} gói dịch vụ`
            }
        } catch (error) {
            console.error('❌ [searchServicePackages] Error:', error)
            return handleServerActionError(error, 'Failed to search service packages')
        }
    })
}

'use server'

import { apiBulkCreateServicePackageFeatures } from '@/services/service-package/ServicePackageFeatureService'
import { revalidatePath } from 'next/cache'
import { withAuthCheck } from '@/utils/withAuthCheck'
import { handleServerActionError } from '@/utils/serverActionErrorHandler'

/**
 * Server Action to bulk create features for a service package.
 * The core logic is wrapped with `withAuthCheck` to handle authentication errors centrally.
 */
export default async function bulkCreateServicePackageFeatures(packageId, features) {
    return withAuthCheck(async () => {
        try {
            // Validation
            if (!packageId) {
                return {
                    success: false,
                    message: 'ID gói dịch vụ không hợp lệ'
                }
            }

            if (!features || !Array.isArray(features) || features.length === 0) {
                return {
                    success: false,
                    message: 'Danh sách tính năng không hợp lệ'
                }
            }

            // Validate each feature
            for (const feature of features) {
                if (!feature.name || !feature.name.trim()) {
                    return {
                        success: false,
                        message: 'Tên tính năng không được để trống'
                    }
                }
            }

            const response = await apiBulkCreateServicePackageFeatures(packageId, features)
            
            revalidatePath('/concepts/service-package-management')
            
            return {
                success: true,
                data: response,
                message: `Tạo ${features.length} tính năng thành công`
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
            
            return handleServerActionError(error, 'Failed to bulk create service package features')
        }
    })
}

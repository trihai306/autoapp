'use server'

import { apiUpdateServicePackageFeature } from '@/services/service-package/ServicePackageFeatureService'
import { revalidatePath } from 'next/cache'
import { withAuthCheck } from '@/utils/withAuthCheck'
import { handleServerActionError } from '@/utils/serverActionErrorHandler'

/**
 * Server Action to update a service package feature.
 * The core logic is wrapped with `withAuthCheck` to handle authentication errors centrally.
 */
export default async function updateServicePackageFeature(featureId, data) {
    return withAuthCheck(async () => {
        try {
            // Validation
            if (!featureId) {
                return {
                    success: false,
                    message: 'ID tính năng không hợp lệ'
                }
            }

            if (!data.name || !data.name.trim()) {
                return {
                    success: false,
                    message: 'Tên tính năng không được để trống'
                }
            }

            const response = await apiUpdateServicePackageFeature(featureId, data)
            
            revalidatePath('/concepts/service-package-management')
            
            return {
                success: true,
                data: response,
                message: 'Cập nhật tính năng gói dịch vụ thành công'
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
            
            return handleServerActionError(error, 'Failed to update service package feature')
        }
    })
}

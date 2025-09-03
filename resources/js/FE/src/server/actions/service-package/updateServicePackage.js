'use server'

import { apiUpdateServicePackage } from '@/services/service-package/ServicePackageService'
import { revalidatePath } from 'next/cache'
import { withAuthCheck } from '@/utils/withAuthCheck'
import { handleServerActionError } from '@/utils/serverActionErrorHandler'

/**
 * Server Action to update a service package.
 * The core logic is wrapped with `withAuthCheck` to handle authentication errors centrally.
 */
export default async function updateServicePackage(id, data) {
    return withAuthCheck(async () => {
        try {
            // Validation
            if (!data.name || !data.name.trim()) {
                return {
                    success: false,
                    message: 'Tên gói dịch vụ không được để trống'
                }
            }

            if (data.price === undefined || data.price === null || data.price < 0) {
                return {
                    success: false,
                    message: 'Giá gói dịch vụ không hợp lệ'
                }
            }

            const response = await apiUpdateServicePackage(id, data)
            
            revalidatePath('/concepts/service-package-management')
            
            return {
                success: true,
                data: response,
                message: 'Cập nhật gói dịch vụ thành công'
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
            
            return handleServerActionError(error, 'Failed to update service package')
        }
    })
}

'use server'

import { apiRequest } from '@/utils/api'

export default async function deleteServicePackageCategory(id) {
    try {
        const response = await apiRequest(`/api/service-package-categories/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
        })

        if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.message || 'Failed to delete service package category')
        }

        const result = await response.json()
        
        return {
            success: true,
            data: result.data,
            message: result.message || 'Service package category deleted successfully'
        }
    } catch (error) {
        console.error('Error deleting service package category:', error)
        return {
            success: false,
            data: null,
            message: error.message || 'Failed to delete service package category'
        }
    }
}

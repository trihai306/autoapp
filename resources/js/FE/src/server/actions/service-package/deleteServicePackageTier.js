'use server'

import { apiRequest } from '@/utils/api'

export default async function deleteServicePackageTier(id) {
    try {
        const response = await apiRequest(`/api/service-package-tiers/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
        })

        if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.message || 'Failed to delete service package tier')
        }

        const result = await response.json()
        
        return {
            success: true,
            data: result.data,
            message: result.message || 'Service package tier deleted successfully'
        }
    } catch (error) {
        console.error('Error deleting service package tier:', error)
        return {
            success: false,
            data: null,
            message: error.message || 'Failed to delete service package tier'
        }
    }
}

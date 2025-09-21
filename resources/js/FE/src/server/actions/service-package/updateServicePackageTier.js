'use server'

import { apiRequest } from '@/utils/api'

export default async function updateServicePackageTier(id, data) {
    try {
        const response = await apiRequest(`/api/service-package-tiers/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        })

        if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.message || 'Failed to update service package tier')
        }

        const result = await response.json()
        
        return {
            success: true,
            data: result.data,
            message: result.message || 'Service package tier updated successfully'
        }
    } catch (error) {
        console.error('Error updating service package tier:', error)
        return {
            success: false,
            data: null,
            message: error.message || 'Failed to update service package tier'
        }
    }
}

'use server'

import { apiRequest } from '@/utils/api'

export default async function createServicePackageCategory(data) {
    try {
        const response = await apiRequest('/api/service-package-categories', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        })

        if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.message || 'Failed to create service package category')
        }

        const result = await response.json()
        
        return {
            success: true,
            data: result.data,
            message: result.message || 'Service package category created successfully'
        }
    } catch (error) {
        console.error('Error creating service package category:', error)
        return {
            success: false,
            data: null,
            message: error.message || 'Failed to create service package category'
        }
    }
}

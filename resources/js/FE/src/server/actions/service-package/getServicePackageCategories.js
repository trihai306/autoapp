'use server'

import { apiRequest } from '@/utils/api'

export default async function getServicePackageCategories(params = {}) {
    try {
        const queryParams = new URLSearchParams()
        
        // Add pagination params
        if (params.page) queryParams.append('page', params.page)
        if (params.per_page) queryParams.append('per_page', params.per_page)
        
        // Add filter params
        if (params.search) queryParams.append('search', params.search)
        if (params.is_active !== undefined) queryParams.append('is_active', params.is_active)
        
        const queryString = queryParams.toString()
        const url = `/api/service-package-categories${queryString ? `?${queryString}` : ''}`
        
        const response = await apiRequest(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        })

        if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.message || 'Failed to fetch service package categories')
        }

        const data = await response.json()
        
        return {
            success: true,
            data: data.data || [],
            total: data.total || 0,
            message: data.message || 'Service package categories fetched successfully'
        }
    } catch (error) {
        console.error('Error fetching service package categories:', error)
        return {
            success: false,
            data: [],
            total: 0,
            message: error.message || 'Failed to fetch service package categories'
        }
    }
}

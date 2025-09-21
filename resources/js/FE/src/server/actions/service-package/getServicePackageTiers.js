'use server'

import { apiRequest } from '@/utils/api'

export default async function getServicePackageTiers(params = {}) {
    try {
        const queryParams = new URLSearchParams()
        
        // Add pagination params
        if (params.page) queryParams.append('page', params.page)
        if (params.per_page) queryParams.append('per_page', params.per_page)
        
        // Add filter params
        if (params.search) queryParams.append('search', params.search)
        if (params.is_active !== undefined) queryParams.append('is_active', params.is_active)
        if (params.is_popular !== undefined) queryParams.append('is_popular', params.is_popular)
        if (params.service_package_id) queryParams.append('service_package_id', params.service_package_id)
        if (params.min_price) queryParams.append('min_price', params.min_price)
        if (params.max_price) queryParams.append('max_price', params.max_price)
        if (params.min_device_limit) queryParams.append('min_device_limit', params.min_device_limit)
        if (params.max_device_limit) queryParams.append('max_device_limit', params.max_device_limit)
        
        const queryString = queryParams.toString()
        const url = `/api/service-package-tiers${queryString ? `?${queryString}` : ''}`
        
        const response = await apiRequest(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        })

        if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.message || 'Failed to fetch service package tiers')
        }

        const data = await response.json()
        
        return {
            success: true,
            data: data.data || [],
            total: data.total || 0,
            message: data.message || 'Service package tiers fetched successfully'
        }
    } catch (error) {
        console.error('Error fetching service package tiers:', error)
        return {
            success: false,
            data: [],
            total: 0,
            message: error.message || 'Failed to fetch service package tiers'
        }
    }
}

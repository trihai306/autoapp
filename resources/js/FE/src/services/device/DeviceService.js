import ApiService from '@/services/ApiService'

/**
 * Device Service - API functions for device management
 */

// Get all devices with pagination, search, and filters
export async function apiGetDevices(params) {
    return ApiService.fetchDataWithAxios({
        url: '/devices',
        method: 'get',
        params,
    })
}

// Get a single device by ID
export async function apiGetDevice(id) {
    return ApiService.fetchDataWithAxios({
        url: `/devices/${id}`,
        method: 'get',
    })
}

// Create a new device
export async function apiCreateDevice(data) {
    return ApiService.fetchDataWithAxios({
        url: '/devices',
        method: 'post',
        data,
    })
}

// Update a device
export async function apiUpdateDevice(id, data) {
    return ApiService.fetchDataWithAxios({
        url: `/devices/${id}`,
        method: 'put',
        data,
    })
}

// Delete a device
export async function apiDeleteDevice(id) {
    return ApiService.fetchDataWithAxios({
        url: `/devices/${id}`,
        method: 'delete',
    })
}

// Bulk delete devices
export async function apiDeleteDevices(data) {
    return ApiService.fetchDataWithAxios({
        url: '/devices/bulk-delete',
        method: 'post',
        data,
    })
}

// Update device status
export async function apiUpdateDeviceStatus(data) {
    return ApiService.fetchDataWithAxios({
        url: '/devices/bulk-update-status',
        method: 'post',
        data,
    })
}

// Get device statistics
export async function apiGetDeviceStats() {
    return ApiService.fetchDataWithAxios({
        url: '/devices/stats',
        method: 'get',
    })
}

// Get recent device activities
export async function apiGetDeviceRecentActivities() {
    return ApiService.fetchDataWithAxios({
        url: '/devices/recent-activities',
        method: 'get',
    })
}

// Import devices from list
export async function apiImportDevices(data) {
    return ApiService.fetchDataWithAxios({
        url: '/devices/import',
        method: 'post',
        data,
    })
}
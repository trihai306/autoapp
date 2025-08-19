import ApiService from '@/services/ApiService'

/**
 * Proxy Service - API functions for proxy management
 */

// Get all proxies with pagination, search, and filters
export async function apiGetProxies(params) {
    return ApiService.fetchDataWithAxios({
        url: '/proxies',
        method: 'get',
        params,
    })
}

// Get a single proxy by ID
export async function apiGetProxy(id) {
    return ApiService.fetchDataWithAxios({
        url: `/proxies/${id}`,
        method: 'get',
    })
}

// Create a new proxy
export async function apiCreateProxy(data) {
    return ApiService.fetchDataWithAxios({
        url: '/proxies',
        method: 'post',
        data,
    })
}

// Update a proxy
export async function apiUpdateProxy(id, data) {
    return ApiService.fetchDataWithAxios({
        url: `/proxies/${id}`,
        method: 'put',
        data,
    })
}

// Delete a proxy
export async function apiDeleteProxy(id) {
    return ApiService.fetchDataWithAxios({
        url: `/proxies/${id}`,
        method: 'delete',
    })
}

// Bulk delete proxies
export async function apiBulkDeleteProxies(ids) {
    return ApiService.fetchDataWithAxios({
        url: '/proxies/bulk-delete',
        method: 'post',
        data: { ids },
    })
}

// Bulk update proxy status
export async function apiBulkUpdateProxyStatus(ids, status) {
    return ApiService.fetchDataWithAxios({
        url: '/proxies/bulk-update-status',
        method: 'post',
        data: { ids, status },
    })
}

// Test proxy connection
export async function apiTestProxyConnection(id) {
    return ApiService.fetchDataWithAxios({
        url: `/proxies/${id}/test-connection`,
        method: 'post',
    })
}

// Get active proxies for current user
export async function apiGetActiveProxies() {
    return ApiService.fetchDataWithAxios({
        url: '/proxies/active',
        method: 'get',
    })
}

// Get proxy statistics
export async function apiGetProxyStats(params = {}) {
    return ApiService.fetchDataWithAxios({
        url: '/proxies/stats',
        method: 'get',
        params,
    })
}

// Import proxies from list
export async function apiImportProxies(data) {
    return ApiService.fetchDataWithAxios({
        url: '/proxies/import',
        method: 'post',
        data,
    })
}

// Get proxy full URL
export async function apiGetProxyFullUrl(id) {
    return ApiService.fetchDataWithAxios({
        url: `/proxies/${id}/full-url`,
        method: 'get',
    })
}

import ApiService from '@/services/ApiService'

/**
 * Account Task Service - API functions for account task management
 */

// Get all account tasks with pagination, search, and filters
export async function apiGetAccountTasks(params = {}) {
    return ApiService.fetchDataWithAxios({
        url: '/account-tasks',
        method: 'get',
        params,
    })
}

// Get a single account task by ID
export async function apiGetAccountTask(id) {
    return ApiService.fetchDataWithAxios({
        url: `/account-tasks/${id}`,
        method: 'get',
    })
}

// Delete a single account task
export async function apiDeleteAccountTask(id) {
    return ApiService.fetchDataWithAxios({
        url: `/account-tasks/${id}`,
        method: 'delete',
    })
}

// Bulk delete account tasks
export async function apiBulkDeleteAccountTasks(taskIds) {
    return ApiService.fetchDataWithAxios({
        url: '/account-tasks/bulk-delete',
        method: 'post',
        data: { ids: taskIds },
    })
}

// Update account task status
export async function apiUpdateAccountTaskStatus(id, status) {
    return ApiService.fetchDataWithAxios({
        url: `/account-tasks/${id}`,
        method: 'put',
        data: { status },
    })
}

// Bulk update account task status
export async function apiBulkUpdateAccountTaskStatus(taskIds, status) {
    return ApiService.fetchDataWithAxios({
        url: '/account-tasks/bulk-update-status',
        method: 'post',
        data: { ids: taskIds, status },
    })
}

// Get recent activities for TikTok accounts
export async function apiGetRecentActivities(params = {}) {
    return ApiService.fetchDataWithAxios({
        url: '/account-tasks/recent-activities',
        method: 'get',
        params,
    })
}

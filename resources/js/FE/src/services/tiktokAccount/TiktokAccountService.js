import ApiService from '@/services/ApiService'

/**
 * TikTok Account Service - API functions for TikTok account management
 */

// Get all TikTok accounts with pagination, search, and filters
export async function apiGetTiktokAccounts(params) {
    return ApiService.fetchDataWithAxios({
        url: '/tiktok-accounts',
        method: 'get',
        params,
    })
}

// Get a single TikTok account by ID with detailed information
export async function apiGetTiktokAccount(id) {
    return ApiService.fetchDataWithAxios({
        url: `/tiktok-accounts/${id}`,
        method: 'get',
    })
}

// Create a new TikTok account
export async function apiCreateTiktokAccount(data) {
    return ApiService.fetchDataWithAxios({
        url: '/tiktok-accounts',
        method: 'post',
        data,
    })
}

// Update a TikTok account
export async function apiUpdateTiktokAccount(id, data) {
    return ApiService.fetchDataWithAxios({
        url: `/tiktok-accounts/${id}`,
        method: 'put',
        data,
    })
}

// Delete a TikTok account
export async function apiDeleteTiktokAccount(id) {
    return ApiService.fetchDataWithAxios({
        url: `/tiktok-accounts/${id}`,
        method: 'delete',
    })
}

// Bulk delete TikTok accounts
export async function apiBulkDeleteTiktokAccounts(ids) {
    return ApiService.fetchDataWithAxios({
        url: '/tiktok-accounts/bulk-delete',
        method: 'post',
        data: { ids },
    })
}

// Bulk update status for TikTok accounts
export async function apiBulkUpdateTiktokAccountStatus(ids, status) {
    return ApiService.fetchDataWithAxios({
        url: '/tiktok-accounts/bulk-update-status',
        method: 'post',
        data: { ids, status },
    })
}

// Import TikTok accounts
export async function apiImportTiktokAccounts(data) {
    return ApiService.fetchDataWithAxios({
        url: '/tiktok-accounts/import',
        method: 'post',
        data,
    })
}

// Get TikTok account statistics
export async function apiGetTiktokAccountStats() {
    return ApiService.fetchDataWithAxios({
        url: '/tiktok-accounts/stats',
        method: 'get',
    })
}

// Get TikTok account task analysis
export async function apiGetTiktokAccountTaskAnalysis() {
    return ApiService.fetchDataWithAxios({
        url: '/tiktok-accounts/task-analysis',
        method: 'get',
    })
}

// Get TikTok account activity history
export async function apiGetTiktokAccountActivityHistory(id, params = {}) {
    return ApiService.fetchDataWithAxios({
        url: `/tiktok-accounts/${id}/activity-history`,
        method: 'get',
        params,
    })
}

// Run linked scenario for an account (create account tasks from scenario scripts)
export async function apiRunAccountScenario(id, data = {}) {
    return ApiService.fetchDataWithAxios({
        url: `/tiktok-accounts/${id}/run-scenario`,
        method: 'post',
        data,
    })
}

// Enable two-factor authentication for a TikTok account
export async function apiEnable2FA(id, data = {}) {
    return ApiService.fetchDataWithAxios({
        url: `/tiktok-accounts/${id}/enable-2fa`,
        method: 'post',
        data,
    })
}

// Disable two-factor authentication for a TikTok account
export async function apiDisable2FA(id) {
    return ApiService.fetchDataWithAxios({
        url: `/tiktok-accounts/${id}/disable-2fa`,
        method: 'post',
    })
}

// Regenerate backup codes for a TikTok account
export async function apiRegenerateBackupCodes(id) {
    return ApiService.fetchDataWithAxios({
        url: `/tiktok-accounts/${id}/regenerate-backup-codes`,
        method: 'post',
    })
}
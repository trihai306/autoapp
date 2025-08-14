import ApiService from '@/services/ApiService'

export async function apiGetTiktokAccounts(params) {
    return ApiService.fetchDataWithAxios({
        url: '/tiktok-accounts',
        method: 'get',
        params,
    })
}

export async function apiGetTiktokAccount(id) {
    return ApiService.fetchDataWithAxios({
        url: `/tiktok-accounts/${id}`,
        method: 'get',
    })
}

export async function apiCreateTiktokAccount(data) {
    return ApiService.fetchDataWithAxios({
        url: '/tiktok-accounts',
        method: 'post',
        data,
    })
}

export async function apiUpdateTiktokAccount(id, data) {
    return ApiService.fetchDataWithAxios({
        url: `/tiktok-accounts/${id}`,
        method: 'put',
        data,
    })
}

export async function apiDeleteTiktokAccounts(data) {
    return ApiService.fetchDataWithAxios({
        url: '/tiktok-accounts/bulk-delete',
        method: 'post',
        data,
    })
}

export async function apiUpdateTiktokAccountStatus(data) {
    return ApiService.fetchDataWithAxios({
        url: '/tiktok-accounts/bulk-update-status',
        method: 'post',
        data,
    })
}

export async function apiImportTiktokAccounts(data) {
    // // console.log('TiktokAccountService - apiImportTiktokAccounts called with:', data)
    const response = await ApiService.fetchDataWithAxios({
        url: '/tiktok-accounts/import',
        method: 'post',
        data,
    })
    // // console.log('TiktokAccountService - apiImportTiktokAccounts response:', response)
    return response
}

export async function apiGetTiktokAccountStats() {
    return ApiService.fetchDataWithAxios({
        url: '/tiktok-accounts/stats',
        method: 'get',
    })
}

export async function apiGetTiktokAccountRecentActivities() {
    return ApiService.fetchDataWithAxios({
        url: '/tiktok-accounts/recent-activities',
        method: 'get',
    })
}

export async function apiDeletePendingTasks(data) {
    return ApiService.fetchDataWithAxios({
        url: '/tiktok-accounts/delete-pending-tasks',
        method: 'post',
        data,
    })
} 
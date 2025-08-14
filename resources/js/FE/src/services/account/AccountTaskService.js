import ApiService from '@/services/ApiService'

export async function apiGetAccountTasks(params) {
    return ApiService.fetchDataWithAxios({
        url: '/account-tasks',
        method: 'get',
        params,
    })
}

export async function apiDeleteAccountTask(id) {
    return ApiService.fetchDataWithAxios({
        url: `/account-tasks/${id}`,
        method: 'delete',
    })
}

export async function apiUpdateAccountTaskStatus(id, status) {
    return ApiService.fetchDataWithAxios({
        url: `/account-tasks/${id}/status`,
        method: 'put',
        data: { status },
    })
}

import ApiService from '@/services/ApiService'

export async function apiGetRoles(params) {
    return ApiService.fetchDataWithAxios({
        url: '/roles',
        method: 'get',
        params,
    })
}

export async function apiCreateRole(data) {
    return ApiService.fetchDataWithAxios({
        url: '/roles',
        method: 'post',
        data,
    })
}

export async function apiUpdateRole(id, data) {
    return ApiService.fetchDataWithAxios({
        url: `/roles/${id}`,
        method: 'put',
        data,
    })
}

export async function apiDeleteRoles(ids) {
    return ApiService.fetchDataWithAxios({
        url: '/roles/bulk-delete',
        method: 'post',
        data: { ids },
    })
}

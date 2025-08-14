import ApiService from '@/services/ApiService'

export async function apiGetPermissions(params) {
    return ApiService.fetchDataWithAxios({
        url: '/permissions',
        method: 'get',
        params,
    })
}

export async function apiCreatePermission(data) {
    return ApiService.fetchDataWithAxios({
        url: '/permissions',
        method: 'post',
        data,
    })
}

export async function apiUpdatePermission(id, data) {
    return ApiService.fetchDataWithAxios({
        url: `/permissions/${id}`,
        method: 'put',
        data,
    })
}

export async function apiDeletePermissions(ids) {
    return ApiService.fetchDataWithAxios({
        url: '/permissions/bulk-delete',
        method: 'post',
        data: { ids },
    })
}

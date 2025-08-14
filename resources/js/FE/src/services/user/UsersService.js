import ApiService from '@/services/ApiService'

export async function apiGetUsers(params) {
    return ApiService.fetchDataWithAxios({
        url: '/users',
        method: 'get',
        params,
    })
}

export async function apiGetUser(id) {
    return ApiService.fetchDataWithAxios({
        url: `/users/${id}`,
        method: 'get',
    })
}

export async function apiCreateUser(data) {
    return ApiService.fetchDataWithAxios({
        url: '/users',
        method: 'post',
        data,
    })
}

export async function apiUpdateUser(id, data) {
    return ApiService.fetchDataWithAxios({
        url: `/users/${id}`,
        method: 'put',
        data,
    })
}

export async function apiDeleteUsers(data) {
    return ApiService.fetchDataWithAxios({
        url: '/users/bulk-delete',
        method: 'post',
        data,
    })
}

export async function apiUpdateUserStatus(data) {
    return ApiService.fetchDataWithAxios({
        url: '/users/bulk-update-status',
        method: 'post',
        data,
    })
}

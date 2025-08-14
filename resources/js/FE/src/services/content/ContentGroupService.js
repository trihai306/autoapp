import ApiService from '@/services/ApiService'

export async function apiGetContentGroups(params) {
    return ApiService.fetchDataWithAxios({
        url: '/content-groups',
        method: 'get',
        params,
    })
}

export async function apiGetContentGroup(id) {
    return ApiService.fetchDataWithAxios({
        url: `/content-groups/${id}`,
        method: 'get',
    })
}

export async function apiCreateContentGroup(data) {
    return ApiService.fetchDataWithAxios({
        url: '/content-groups',
        method: 'post',
        data,
    })
}

export async function apiUpdateContentGroup(id, data) {
    return ApiService.fetchDataWithAxios({
        url: `/content-groups/${id}`,
        method: 'put',
        data,
    })
}

export async function apiDeleteContentGroups(data) {
    return ApiService.fetchDataWithAxios({
        url: '/content-groups/bulk-delete',
        method: 'post',
        data,
    })
}

export async function apiGetContentGroupWithContents(id) {
    return ApiService.fetchDataWithAxios({
        url: `/content-groups/${id}/contents`,
        method: 'get',
    })
}

export async function apiGetContentsByGroup(groupId) {
    return ApiService.fetchDataWithAxios({
        url: `/content-groups/${groupId}/contents`,
        method: 'get',  
    })
}
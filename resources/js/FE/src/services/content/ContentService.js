import ApiService from '@/services/ApiService'

export async function apiGetContents(params) {
    return ApiService.fetchDataWithAxios({
        url: '/contents',
        method: 'get',
        params,
    })
}

export async function apiGetContent(id) {
    return ApiService.fetchDataWithAxios({
        url: `/contents/${id}`,
        method: 'get',
    })
}

export async function apiCreateContent(data) {
    return ApiService.fetchDataWithAxios({
        url: '/contents',
        method: 'post',
        data,
    })
}

export async function apiUpdateContent(id, data) {
    return ApiService.fetchDataWithAxios({
        url: `/contents/${id}`,
        method: 'put',
        data,
    })
}

export async function apiDeleteContents(data) {
    return ApiService.fetchDataWithAxios({
        url: '/contents/bulk-delete',
        method: 'post',
        data,
    })
}

export async function apiGetContentsByGroup(groupId, params) {
    return ApiService.fetchDataWithAxios({
        url: `/content-groups/${groupId}/contents`,
        method: 'get',
        params,
    })
}

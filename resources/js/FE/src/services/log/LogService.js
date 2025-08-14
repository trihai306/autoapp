import ApiService from '@/services/ApiService'

export async function apiGetLogs(params, token) {
    return ApiService.fetchDataWithAxios({
        url: '/logs',
        method: 'get',
        params,
        headers: {
            Authorization: `Bearer ${token}`,
        },
    })
}

import ApiService from '@/services/ApiService'

export async function apiGetSettings() {
    return ApiService.fetchDataWithAxios({
        url: '/settings',
        method: 'get',
    })
}

export async function apiUpdateSettings(data) {
    return ApiService.fetchDataWithAxios({
        url: '/settings',
        method: 'post',
        data,
    })
}

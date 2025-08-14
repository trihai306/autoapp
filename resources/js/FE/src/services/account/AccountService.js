import ApiService from '@/services/ApiService'

export async function apiGetSettingsNotification(token) {
    return ApiService.fetchDataWithAxios({
        url: '/setting/notification',
        method: 'get',
        headers: {
            Authorization: `Bearer ${token}`,
        },
    })
}

export async function apiGetSettingsBilling() {
    return ApiService.fetchDataWithAxios({
        url: '/settings',
        method: 'get',
    })
}

export async function apiGetSettingsIntergration(token) {
    return ApiService.fetchDataWithAxios({
        url: '/setting/intergration',
        method: 'get',
        headers: {
            Authorization: `Bearer ${token}`,
        },
    })
}

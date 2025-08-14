import ApiService from '@/services/ApiService'

export async function apiGetNotifications(params) {
    return ApiService.fetchDataWithAxios({
        url: '/notifications',
        method: 'get',
        params,
    })
}

export async function apiMarkNotificationAsRead(id) {
    return ApiService.fetchDataWithAxios({
        url: `/notifications/${id}/read`,
        method: 'patch',
    })
}

export async function apiMarkAllNotificationsAsRead() {
    return ApiService.fetchDataWithAxios({
        url: '/notifications/mark-all-as-read',
        method: 'post',
    })
}

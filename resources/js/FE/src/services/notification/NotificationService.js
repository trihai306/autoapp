import ApiService from '@/services/ApiService'


export async function apiGetNotifications(params) {
    return ApiService.fetchDataWithAxios({
        url: '/my-notifications',
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

export async function apiDeleteNotification(id) {
    return ApiService.fetchDataWithAxios({
        url: `/notifications/${id}`,
        method: 'delete',
    })
}

export async function apiDeleteMultipleNotifications(data) {
    return ApiService.fetchDataWithAxios({
        url: '/notifications/bulk-delete',
        method: 'post',
        data,
    })
}

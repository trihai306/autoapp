import ApiService from '@/services/ApiService'

export async function apiSignIn(data) {
    return ApiService.fetchData({
        url: '/login',
        method: 'post',
        data,
    })
}

export async function apiSignUp(data) {
    return ApiService.fetchData({
        url: '/register',
        method: 'post',
        data,
    })
}

export async function apiLogout(token) {
    return ApiService.fetchData({
        url: '/logout',
        method: 'post'
    })
}

export async function apiForgotPassword(data) {
    return ApiService.fetchData({
        url: '/forgot-password',
        method: 'post',
        data,
    })
}

export async function apiResetPassword(data) {
    return ApiService.fetchData({
        url: '/reset-password',
        method: 'post',
        data,
    })
}

export async function apiGetProfile() {
    return ApiService.fetchData({
        url: '/profile',
        method: 'get',
    })
}

export async function apiChangePassword(data) {
    return ApiService.fetchData({
        url: '/profile/change-password',
        method: 'post',
        data,
    })
}

export async function apiUpdateProfile(data) {
    return ApiService.fetchData({
        url: '/profile',
        method: 'put',
        data,
    })
}

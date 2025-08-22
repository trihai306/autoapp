import ApiService from '@/services/ApiService'

export async function apiSignIn(data) {
    return ApiService.fetchDataWithAxios({
        url: '/login',
        method: 'post',
        data,
    })
}

export async function apiSignUp(data) {
    return ApiService.fetchDataWithAxios({
        url: '/register',
        method: 'post',
        data
    })
}

export async function apiLogout(token) {
    return ApiService.fetchDataWithAxios({
        url: '/logout',
        method: 'post',
        data
    })
}

export async function apiForgotPassword(data) {
    return ApiService.fetchDataWithAxios({
        url: '/forgot-password',
        method: 'post',
        data
    })
}

export async function apiResetPassword(data) {
    return ApiService.fetchDataWithAxios({
        url: '/reset-password',
        method: 'post',
        data
    })
}

export async function apiGetProfile() {
    return ApiService.fetchDataWithAxios({
        url: '/profile',
        method: 'get',
    })
}

export async function apiChangePassword(data) {
    return ApiService.fetchDataWithAxios({
        url: '/profile/change-password',
        method: 'post',
        data
    })
}

export async function apiUpdateProfile(data) {
    return ApiService.fetchDataWithAxios({
        url: '/profile',
        method: 'put',
        data
    })
}

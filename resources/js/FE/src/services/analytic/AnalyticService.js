import ApiService from '@/services/ApiService'

export async function apiGetAnalyticDashboard() {
    return ApiService.fetchDataWithAxios({
        url: '/analytic/transactions',
        method: 'get',
    })
}

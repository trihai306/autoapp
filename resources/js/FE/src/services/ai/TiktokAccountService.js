// resources/js/FE/src/services/ai/TiktokAccountService.js
import ApiService from '../ApiService'

export async function apiGetTiktokAccounts(params) {
    return ApiService.fetchDataWithAxios({
        url: '/tiktok-accounts',
        method: 'get',
        params,
    })
}

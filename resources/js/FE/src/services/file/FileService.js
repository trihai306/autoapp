// resources/js/FE/src/services/file/FileService.js
import ApiService from '@/services/ApiService'

export async function apiGetFiles(params) {
    return ApiService.fetchDataWithAxios({
        url: '/files',
        method: 'get',
        params,
    })
}

// resources/js/FE/src/services/file/FileService.js
import ApiService from '@/services/ApiService'

export async function apiGetFiles(params) {
    return ApiService.fetchDataWithAxios({
        url: '/files',
        method: 'get',
        params,
    })
}

export async function apiUploadFile(file) {
    const formData = new FormData()
    formData.append('file', file)
    return ApiService.fetchDataWithAxios({
        url: '/files/upload',
        method: 'post',
        headers: { 'Content-Type': 'multipart/form-data' },
        data: formData,
    })
}

import ApiService from '@/services/ApiService'

export async function apiGetFacebookAccounts(params) {
    return ApiService.fetchDataWithAxios({
        url: '/facebook-accounts',
        method: 'get',
        params,
    })
}

export async function apiGetFacebookAccount(id) {
    return ApiService.fetchDataWithAxios({
        url: `/facebook-accounts/${id}`,
        method: 'get',
    })
}

export async function apiImportFacebookAccounts(data) {
    return ApiService.fetchDataWithAxios({
        url: '/facebook-accounts/import',
        method: 'post',
        data,
    })
}

export async function apiGetFacebookAccountStats() {
    return ApiService.fetchDataWithAxios({
        url: '/facebook-accounts/stats',
        method: 'get',
    })
}

export async function apiUpdateFacebookAccount(id, data) {
    return ApiService.fetchDataWithAxios({
        url: `/facebook-accounts/${id}`,
        method: 'patch',
        data,
    })
}

export async function apiUpdateFacebookAccountConnectionType(id, connection_type) {
    return ApiService.fetchDataWithAxios({
        url: `/facebook-accounts/${id}/connection-type`,
        method: 'patch',
        data: { connection_type },
    })
}

export async function apiBulkUpdateFacebookAccountConnectionType(account_ids, connection_type) {
    return ApiService.fetchDataWithAxios({
        url: '/facebook-accounts/connection-type/bulk',
        method: 'post',
        data: { account_ids, connection_type },
    })
}

export async function apiRunFacebookAccountScenario(accountId) {
    return ApiService.fetchDataWithAxios({
        url: `/facebook-accounts/${accountId}/run-scenario`,
        method: 'post',
    })
}

export async function apiStopFacebookAccountTasks(accountId) {
    return ApiService.fetchDataWithAxios({
        url: `/facebook-accounts/${accountId}/stop-tasks`,
        method: 'post',
    })
}

export async function apiBulkRunFacebookAccountScenario(accountIds) {
    return ApiService.fetchDataWithAxios({
        url: '/facebook-accounts/run-scenario/bulk',
        method: 'post',
        data: { account_ids: accountIds },
    })
}

export async function apiBulkStopFacebookAccountTasks(accountIds) {
    return ApiService.fetchDataWithAxios({
        url: '/facebook-accounts/stop-tasks/bulk',
        method: 'post',
        data: { account_ids: accountIds },
    })
}

export async function apiGetFacebookAccountTasks(accountId, params = {}) {
    return ApiService.fetchDataWithAxios({
        url: `/facebook-accounts/${accountId}/tasks`,
        method: 'get',
        params,
    })
}

export async function apiGetFacebookAccountStatus(accountId) {
    return ApiService.fetchDataWithAxios({
        url: `/facebook-accounts/${accountId}/status`,
        method: 'get',
    })
}

export async function apiGetAllFacebookAccountTasks(params = {}) {
    return ApiService.fetchDataWithAxios({
        url: '/facebook-accounts/tasks/all',
        method: 'get',
        params,
    })
}

export async function apiGetAllFacebookAccountsStatus(params = {}) {
    return ApiService.fetchDataWithAxios({
        url: '/facebook-accounts/status/all',
        method: 'get',
        params,
    })
}

export async function apiGetFacebookAccountBatchData(params = {}) {
    return ApiService.fetchDataWithAxios({
        url: '/facebook-accounts/batch-data',
        method: 'get',
        params,
    })
}

export async function apiRunFacebookInteractions(data) {
    return ApiService.fetchDataWithAxios({
        url: '/facebook-accounts/interactions/run',
        method: 'post',
        data,
    })
}



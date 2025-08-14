// resources/js/FE/src/services/customer/CustomersService.js
import ApiService from '@/services/ApiService'

export async function apiGetCustomerLog({ ...params }) {
    return ApiService.fetchDataWithAxios({
        url: `/customers/log`,
        method: 'get',
        params,
    })
}

export async function apiGetCustomers({ ...params }) {
    return ApiService.fetchDataWithAxios({
        url: `/customers`,
        method: 'get',
        params,
    })
}

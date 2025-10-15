import React from 'react'
import FacebookAccountManagementClient from './FacebookAccountManagementClient'
import { FacebookAccountDataProvider } from './_components/FacebookAccountDataManager'
import getFacebookAccounts from '@/server/actions/facebook-account/getFacebookAccounts'

export const dynamic = 'force-dynamic'

export default async function Page({ searchParams }) {
    const sp = (typeof searchParams?.then === 'function') ? await searchParams : searchParams
    const params = {
        page: sp?.page || '1',
        per_page: sp?.per_page || '10',
        search: sp?.search,
        'filter[username]': sp?.['filter[username]'],
        'filter[email]': sp?.['filter[email]'],
        'filter[phone_number]': sp?.['filter[phone_number]'],
        'filter[status]': sp?.['filter[status]'],
        'filter[connection_type]': sp?.['filter[connection_type]'],
        'filter[proxy_status]': sp?.['filter[proxy_status]'],
    }
    const res = await getFacebookAccounts(params)
    const data = { list: res.list || [], total: res.total || 0 }
    return (
        <FacebookAccountDataProvider>
            <FacebookAccountManagementClient data={data} params={params} />
        </FacebookAccountDataProvider>
    )
}



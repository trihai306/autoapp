import getTiktokAccounts from '@/server/actions/tiktok-account/getTiktokAccounts'
import TiktokAccountManagementClient from './TiktokAccountManagementClient.jsx'

export default async function Page({ searchParams }) {

    const params = await searchParams
    const data = await getTiktokAccounts(params)
    
    return (
        <TiktokAccountManagementClient
            data={data}
            params={{
                page: params.page,
                per_page: params.per_page,
                sort: params.sort,
                order: params.order,
                search: params.search,
            }}
        />
    )
} 
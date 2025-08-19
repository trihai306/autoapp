import getProxies from '@/server/actions/proxy/getProxies'
import getProxyStats from '@/server/actions/proxy/getProxyStats'
import ProxyManagementClient from './ProxyManagementClient'

export default async function Page({ searchParams }) {
    const params = await searchParams
    const data = await getProxies(params)
    const stats = await getProxyStats()

    // Ensure data has the expected structure
    const safeData = {
        list: data?.list || [],
        total: data?.total || 0
    }

    return (
        <ProxyManagementClient
            data={safeData}
            stats={stats || {}}
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

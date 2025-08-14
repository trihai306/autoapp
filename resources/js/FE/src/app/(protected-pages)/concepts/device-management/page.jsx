import getDevices from '@/server/actions/device/getDevices'
import DeviceManagementClient from './DeviceManagementClient.jsx'

export default async function Page({ searchParams }) {
    const params = await searchParams

    
    const data = await getDevices(params)


    return (
        <DeviceManagementClient
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

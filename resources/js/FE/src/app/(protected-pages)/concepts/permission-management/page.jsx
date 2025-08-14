import getPermissions from '@/server/actions/user/getPermissions'
import PermissionManagementClient from './PermissionManagementClient'

export default async function Page({ searchParams }) {
    const params = await searchParams
    const data = await getPermissions(params)

    return (
        <PermissionManagementClient
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
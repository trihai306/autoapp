import getRoles from '@/server/actions/user/getRoles'
import RoleManagementClient from './RoleManagementClient'

export default async function Page({ searchParams }) {
    const params = await searchParams
    const data = await getRoles(params)

    return (
        <RoleManagementClient
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

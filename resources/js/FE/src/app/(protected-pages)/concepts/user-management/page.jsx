import getUsers from '@/server/actions/user/getUsers'
import UserManagementClient from './UserManagementClient'

export default async function Page({ searchParams }) {
    const params = await searchParams
    const data = await getUsers(params)

    return (
        <UserManagementClient
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

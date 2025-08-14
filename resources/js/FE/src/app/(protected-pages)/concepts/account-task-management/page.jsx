import getAccountTasks from '@/server/actions/account/getAccountTasks'
import AccountTaskManagementClient from './_components/AccountTaskManagementClient'

export default async function Page({ searchParams }) {
    const params = await searchParams
    const data = await getAccountTasks(params)

    return <AccountTaskManagementClient data={data} params={params} />
}

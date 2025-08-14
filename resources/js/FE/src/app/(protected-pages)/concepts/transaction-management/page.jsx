import getTransactions from '@/server/actions/transaction/getTransactions'
import TransactionManagementClient from './_components/TransactionManagementClient'

export default async function Page({ searchParams }) {
    const params = await searchParams
    const data = await getTransactions(params)

    return <TransactionManagementClient data={data} params={params} />
}

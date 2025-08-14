import TransactionAnalyticDashboard from './_components/TransactionAnalyticDashboard'
import getTransactionAnalyticDashboard from '@/server/actions/analytic/getTransactionAnalyticDashboard'

export default async function Page() {
    const data = await getTransactionAnalyticDashboard()

    return <TransactionAnalyticDashboard data={data} />
}

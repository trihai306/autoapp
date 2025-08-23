import TransactionAnalyticDashboard from './_components/TransactionAnalyticDashboard'
import getTransactionAnalyticDashboard from '@/server/actions/analytic/getTransactionAnalyticDashboard'

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic'

export default async function Page() {
    const data = await getTransactionAnalyticDashboard()

    return <TransactionAnalyticDashboard data={data} />
}

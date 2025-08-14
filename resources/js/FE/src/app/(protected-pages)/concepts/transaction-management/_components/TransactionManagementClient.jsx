'use client'
import { useState, useEffect } from 'react'
import Container from '@/components/shared/Container'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import TransactionListProvider from './TransactionListProvider'
import TransactionListTable from './TransactionListTable'
import { useTranslations } from 'next-intl'
import { DashboardHeader, StatCard } from '@/components/shared/stats'
import { useRouter } from 'next/navigation'
import { 
    HiOutlineCreditCard as CreditCard,
    HiOutlineArrowUp as ArrowUp,
    HiOutlineArrowDown as ArrowDown,
    HiOutlineClock as Clock,
    HiOutlineCheck as CheckCircle,
    HiOutlineX as XCircle
} from 'react-icons/hi'

const TransactionManagementClient = ({ data, params }) => {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [stats, setStats] = useState({
        totalTransactions: 0,
        pendingTransactions: 0,
        completedTransactions: 0,
        failedTransactions: 0,
        totalAmount: 0,
        depositAmount: 0,
        withdrawalAmount: 0
    })

    const t = useTranslations('transactionManagement')

    useEffect(() => {
        // Calculate stats from data
        if (data && data.list) {
            const transactions = data.list
            const pending = transactions.filter(t => t.status === 'pending')
            const completed = transactions.filter(t => t.status === 'completed')
            const failed = transactions.filter(t => t.status === 'failed')
            const deposits = transactions.filter(t => t.type === 'deposit')
            const withdrawals = transactions.filter(t => t.type === 'withdrawal')

            setStats({
                totalTransactions: data.total || 0,
                pendingTransactions: pending.length,
                completedTransactions: completed.length,
                failedTransactions: failed.length,
                totalAmount: transactions.reduce((sum, t) => sum + parseFloat(t.amount || 0), 0),
                depositAmount: deposits.reduce((sum, t) => sum + parseFloat(t.amount || 0), 0),
                withdrawalAmount: withdrawals.reduce((sum, t) => sum + parseFloat(t.amount || 0), 0)
            })
        }
    }, [data])

    const handleRefresh = async () => {
        setIsLoading(true)
        try {
            router.refresh()
        } finally {
            setTimeout(() => setIsLoading(false), 1000)
        }
    }

    const quickStats = [
        { label: 'Tổng giao dịch', value: stats.totalTransactions },
        { label: 'Chờ duyệt', value: stats.pendingTransactions },
        { label: 'Tổng giá trị', value: `$${stats.totalAmount.toFixed(2)}` }
    ]

    return (
        <TransactionListProvider transactionList={data.list || []}>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                {/* Dashboard Header */}
                <DashboardHeader
                    title={t('title')}
                    subtitle="Quản lý và theo dõi tất cả giao dịch trong hệ thống"
                    onRefresh={handleRefresh}
                    quickStats={quickStats}
                    loading={isLoading}
                />

                <Container className="py-6">
                    <div className="space-y-6">
                        {/* Statistics Dashboard */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <StatCard
                                title="Tổng giao dịch"
                                value={stats.totalTransactions}
                                icon={CreditCard}
                                color="blue"
                                subtitle="Tất cả giao dịch"
                                loading={isLoading}
                            />
                            
                            <StatCard
                                title="Chờ duyệt"
                                value={stats.pendingTransactions}
                                icon={Clock}
                                color="amber"
                                subtitle="Cần xử lý"
                                loading={isLoading}
                            />
                            
                            <StatCard
                                title="Hoàn thành"
                                value={stats.completedTransactions}
                                icon={CheckCircle}
                                color="green"
                                subtitle="Đã xử lý thành công"
                                loading={isLoading}
                            />
                            
                            <StatCard
                                title="Thất bại"
                                value={stats.failedTransactions}
                                icon={XCircle}
                                color="red"
                                subtitle="Giao dịch lỗi"
                                loading={isLoading}
                            />
                        </div>

                        {/* Amount Statistics */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <StatCard
                                title="Tổng giá trị"
                                value={`$${stats.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                                icon={CreditCard}
                                color="indigo"
                                subtitle="Tất cả giao dịch"
                                loading={isLoading}
                            />
                            
                            <StatCard
                                title="Tổng nạp tiền"
                                value={`$${stats.depositAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                                icon={ArrowDown}
                                color="emerald"
                                subtitle="Tiền vào hệ thống"
                                loading={isLoading}
                            />
                            
                            <StatCard
                                title="Tổng rút tiền"
                                value={`$${stats.withdrawalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                                icon={ArrowUp}
                                color="orange"
                                subtitle="Tiền ra khỏi hệ thống"
                                loading={isLoading}
                            />
                        </div>

                        {/* Main Content */}
                        <AdaptiveCard>
                            <div className="flex flex-col gap-4">
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                        Danh sách giao dịch
                                    </h3>
                                </div>
                                <TransactionListTable
                                    transactionListTotal={data.total || 0}
                                    page={parseInt(params.page) || 1}
                                    per_page={parseInt(params.per_page) || 10}
                                />
                            </div>
                        </AdaptiveCard>
                    </div>
                </Container>
            </div>
        </TransactionListProvider>
    )
}

export default TransactionManagementClient

'use client'
import { useState, useEffect } from 'react'
import Container from '@/components/shared/Container'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import UserListProvider from './_components/UserListProvider'
import UserListTable from './_components/UserListTable'
import UserListActionTools from './_components/UserListActionTools'
import { useTranslations } from 'next-intl'
import { DashboardHeader, StatCard } from '@/components/shared/stats'
import { useRouter } from 'next/navigation'
import { 
    HiOutlineUsers as Users,
    HiOutlineUser as UserCheck,
    HiOutlineBan as UserX,
    HiOutlineClock as Clock,
    HiOutlineCurrencyDollar as CurrencyDollar,
    HiOutlineShieldCheck as ShieldCheck
} from 'react-icons/hi'

const UserManagementClient = ({ data, params }) => {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [stats, setStats] = useState({
        totalUsers: 0,
        activeUsers: 0,
        lockedUsers: 0,
        recentUsers: 0,
        totalBalance: 0,
        usersWithRoles: 0
    })

    const t = useTranslations('userManagement')

    useEffect(() => {
        // Calculate stats from data
        if (data && data.list) {
            const users = data.list
            const activeUsers = users.filter(u => u.status === 'active')
            const lockedUsers = users.filter(u => u.status === 'locked')
            const usersWithRoles = users.filter(u => u.roles && u.roles.length > 0)
            
            // Calculate recent users (created in last 7 days)
            const recentUsers = users.filter(user => {
                const createdDate = new Date(user.created_at)
                const weekAgo = new Date()
                weekAgo.setDate(weekAgo.getDate() - 7)
                return createdDate > weekAgo
            })

            // Calculate total balance
            const totalBalance = users.reduce((sum, user) => sum + parseFloat(user.balance || 0), 0)

            setStats({
                totalUsers: data.total || 0,
                activeUsers: activeUsers.length,
                lockedUsers: lockedUsers.length,
                recentUsers: recentUsers.length,
                totalBalance,
                usersWithRoles: usersWithRoles.length
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
        { label: 'Tổng người dùng', value: stats.totalUsers },
        { label: 'Đang hoạt động', value: stats.activeUsers },
        { label: 'Tổng số dư', value: `$${stats.totalBalance.toFixed(2)}` }
    ]

    return (
        <UserListProvider userList={data?.list || []}>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                {/* Dashboard Header */}
                <DashboardHeader
                    title={t('title')}
                    subtitle="Quản lý thông tin và quyền hạn của tất cả người dùng trong hệ thống"
                    onRefresh={handleRefresh}
                    quickStats={quickStats}
                    loading={isLoading}
                />

                <Container className="py-6">
                    <div className="space-y-6">
                        {/* Statistics Dashboard */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <StatCard
                                title="Tổng người dùng"
                                value={stats.totalUsers}
                                icon={Users}
                                color="blue"
                                subtitle="Tất cả tài khoản"
                                loading={isLoading}
                            />
                            
                            <StatCard
                                title="Đang hoạt động"
                                value={stats.activeUsers}
                                icon={UserCheck}
                                color="green"
                                subtitle="Tài khoản active"
                                loading={isLoading}
                            />
                            
                            <StatCard
                                title="Bị khóa"
                                value={stats.lockedUsers}
                                icon={UserX}
                                color="red"
                                subtitle="Tài khoản bị khóa"
                                loading={isLoading}
                            />
                            
                            <StatCard
                                title="Mới tham gia"
                                value={stats.recentUsers}
                                icon={Clock}
                                color="purple"
                                subtitle="Trong 7 ngày qua"
                                loading={isLoading}
                            />
                        </div>

                        {/* Additional Statistics */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <StatCard
                                title="Tổng số dư"
                                value={`$${stats.totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                                icon={CurrencyDollar}
                                color="emerald"
                                subtitle="Tổng tiền trong hệ thống"
                                loading={isLoading}
                            />
                            
                            <StatCard
                                title="Có vai trò"
                                value={stats.usersWithRoles}
                                icon={ShieldCheck}
                                color="indigo"
                                subtitle="Đã được phân quyền"
                                loading={isLoading}
                            />
                        </div>

                        {/* Main Content */}
                        <AdaptiveCard>
                            <div className="flex flex-col gap-4">
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                        Danh sách người dùng
                                    </h3>
                                    <UserListActionTools />
                                </div>
                                <UserListTable
                                    userListTotal={data?.total || 0}
                                    page={parseInt(params.page) || 1}
                                    per_page={parseInt(params.per_page) || 10}
                                />
                            </div>
                        </AdaptiveCard>
                    </div>
                </Container>
            </div>
        </UserListProvider>
    )
}

export default UserManagementClient

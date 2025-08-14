'use client'
import { useState, useEffect } from 'react'
import StatCard from './StatCard'
import getTiktokAccountStats from '@/server/actions/tiktok-account/getTiktokAccountStats'
import { 
    HiOutlineUsers as Users,
    HiOutlineUser as UserCheck,
    HiOutlineUser as UserX,
    HiOutlineLightningBolt as Activity
} from 'react-icons/hi'

const DashboardStats = ({ loading = false }) => {
    const [stats, setStats] = useState({
        totalAccounts: 0,
        activeAccounts: 0,
        inactiveAccounts: 0,
        runningTasks: 0,
        totalAccountsChange: null,
        totalAccountsChangeType: 'neutral',
        activeAccountsChange: null,
        activeAccountsChangeType: 'neutral',
        inactiveAccountsChange: null,
        inactiveAccountsChangeType: 'neutral',
        runningTasksChange: null,
        runningTasksChangeType: 'neutral'
    })

    useEffect(() => {
        const fetchStats = async () => {
            if (!loading) {
                try {
                    const response = await getTiktokAccountStats()
                    if (response.success) {
                        setStats(response.data)
                    } else {
                        console.error('Failed to fetch stats:', response.message)
                        // Fallback to default values
                        setStats({
                            totalAccounts: 0,
                            activeAccounts: 0,
                            inactiveAccounts: 0,
                            runningTasks: 0,
                            totalAccountsChange: null,
                            totalAccountsChangeType: 'neutral',
                            activeAccountsChange: null,
                            activeAccountsChangeType: 'neutral',
                            inactiveAccountsChange: null,
                            inactiveAccountsChangeType: 'neutral',
                            runningTasksChange: null,
                            runningTasksChangeType: 'neutral'
                        })
                    }
                } catch (error) {
                    console.error('Error fetching stats:', error)
                    // Fallback to default values
                    setStats({
                        totalAccounts: 0,
                        activeAccounts: 0,
                        inactiveAccounts: 0,
                        runningTasks: 0,
                        totalAccountsChange: null,
                        totalAccountsChangeType: 'neutral',
                        activeAccountsChange: null,
                        activeAccountsChangeType: 'neutral',
                        inactiveAccountsChange: null,
                        inactiveAccountsChangeType: 'neutral',
                        runningTasksChange: null,
                        runningTasksChangeType: 'neutral'
                    })
                }
            }
        }

        fetchStats()
    }, [loading])

    return (
        <div className="space-y-6">
            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Tổng tài khoản"
                    value={stats.totalAccounts}
                    change={stats.totalAccountsChange}
                    changeType={stats.totalAccountsChangeType}
                    icon={Users}
                    color="blue"
                    subtitle="So với tháng trước"
                    loading={loading}
                />
                
                <StatCard
                    title="Đang hoạt động"
                    value={stats.activeAccounts}
                    change={stats.activeAccountsChange}
                    changeType={stats.activeAccountsChangeType}
                    icon={UserCheck}
                    color="green"
                    subtitle="Tài khoản active"
                    loading={loading}
                />
                
                <StatCard
                    title="Tạm dừng"
                    value={stats.inactiveAccounts}
                    change={stats.inactiveAccountsChange}
                    changeType={stats.inactiveAccountsChangeType}
                    icon={UserX}
                    color="orange"
                    subtitle="Tài khoản inactive"
                    loading={loading}
                />
                
                <StatCard
                    title="Tác vụ đang chạy"
                    value={stats.runningTasks}
                    change={stats.runningTasksChange}
                    changeType={stats.runningTasksChangeType}
                    icon={Activity}
                    color="purple"
                    subtitle="Kịch bản đang thực thi"
                    loading={loading}
                />
            </div>
        </div>
    )
}

export default DashboardStats

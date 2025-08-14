'use client'
import { useState, useEffect } from 'react'
import { 
    HiOutlineCog as Settings,
    HiOutlineRefresh as RefreshCw
} from 'react-icons/hi'
import Button from '@/components/ui/Button'
import getTiktokAccountStats from '@/server/actions/tiktok-account/getTiktokAccountStats'
import { useTranslations } from 'next-intl'

const DashboardHeader = ({ 
    title = "Quản lý tài khoản TikTok",
    subtitle = "Theo dõi và quản lý tất cả tài khoản TikTok của bạn",
    onRefresh,
    onSettings,
    showActions = true
}) => {
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [quickStats, setQuickStats] = useState({
        totalAccounts: 0,
        runningTasks: 0,
        performance: 0
    })
    const t = useTranslations('tiktokAccountManagement')

    const fetchQuickStats = async () => {
        try {
            const response = await getTiktokAccountStats()
            if (response.success) {
                const { totalAccounts, runningTasks, activeAccounts } = response.data
                const performance = totalAccounts > 0 ? Math.round((activeAccounts / totalAccounts) * 100) : 0
                setQuickStats({
                    totalAccounts,
                    runningTasks,
                    performance
                })
            }
        } catch (error) {
            console.error('Error fetching quick stats:', error)
        }
    }

    const handleRefresh = async () => {
        setIsRefreshing(true)
        try {
            await onRefresh?.()
            await fetchQuickStats()
        } finally {
            setTimeout(() => setIsRefreshing(false), 1000)
        }
    }

    useEffect(() => {
        fetchQuickStats()
    }, [])

    return (
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <div className="px-6 py-4">
                {/* Top Section */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
                    {/* Title and Breadcrumb */}
                    <div className="flex-1">
                        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-1">
                            <span>Dashboard</span>
                            <span>/</span>
                            <span>Concepts</span>
                            <span>/</span>
                            <span className="text-gray-900 dark:text-gray-100">TikTok Management</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                {title}
                            </h1>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                                    Live
                                </span>
                            </div>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                            {subtitle}
                        </p>
                    </div>

                    {/* Quick Stats */}
                    <div className="flex items-center gap-6">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                {quickStats.totalAccounts}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Tài khoản</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                                {quickStats.runningTasks}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Đang chạy</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                                {quickStats.performance}%
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Hiệu suất</div>
                        </div>
                    </div>
                </div>

                {/* Action Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    {/* Empty space for balance */}
                    <div className="flex-1"></div>

                    {/* Action Buttons */}
                    {showActions && (
                        <div className="flex items-center gap-2">
                            {/* Refresh */}
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleRefresh}
                                disabled={isRefreshing}
                                className="flex items-center gap-2"
                            >
                                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                                <span className="hidden sm:inline">Làm mới</span>
                            </Button>

                            {/* Interaction Config */}
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={onSettings}
                                className="flex items-center gap-2"
                            >
                                <Settings className="w-4 h-4" />
                                <span className="hidden sm:inline">Cấu hình Tương tác</span>
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default DashboardHeader

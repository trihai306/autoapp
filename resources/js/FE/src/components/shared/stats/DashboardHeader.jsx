'use client'
import { useState, useEffect } from 'react'
import { 
    HiOutlineCog as Settings,
    HiOutlineRefresh as RefreshCw
} from 'react-icons/hi'
import Button from '@/components/ui/Button'
import classNames from 'classnames'

const DashboardHeader = ({ 
    title,
    subtitle,
    onRefresh,
    onSettings,
    showActions = true,
    quickStats = [],
    loading = false,
    className
}) => {
    const [isRefreshing, setIsRefreshing] = useState(false)

    const handleRefresh = async () => {
        setIsRefreshing(true)
        try {
            await onRefresh?.()
        } finally {
            setTimeout(() => setIsRefreshing(false), 1000)
        }
    }

    return (
        <div className={classNames(
            "bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700",
            className
        )}>
            <div className="px-6 py-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    {/* Title Section */}
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                            {title}
                        </h1>
                        {subtitle && (
                            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                {subtitle}
                            </p>
                        )}
                    </div>

                    {/* Quick Stats */}
                    {quickStats.length > 0 && (
                        <div className="flex flex-wrap gap-6">
                            {quickStats.map((stat, index) => (
                                <div key={index} className="text-center">
                                    {loading ? (
                                        <div className="space-y-2">
                                            <div className="h-6 w-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mx-auto"></div>
                                            <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mx-auto"></div>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                                {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
                                            </div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                                {stat.label}
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Actions */}
                    {showActions && (
                        <div className="flex items-center gap-3">
                            <Button
                                variant="outline"
                                icon={<RefreshCw className={classNames("w-4 h-4", { "animate-spin": isRefreshing })} />}
                                onClick={handleRefresh}
                                disabled={isRefreshing}
                            >
                                Làm mới
                            </Button>
                            {onSettings && (
                                <Button
                                    variant="outline"
                                    icon={<Settings className="w-4 h-4" />}
                                    onClick={onSettings}
                                >
                                    Cài đặt
                                </Button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default DashboardHeader

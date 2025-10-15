'use client'
import React from 'react'
import Badge from '@/components/ui/Badge'
import { TbRefresh, TbClock, TbAlertCircle } from 'react-icons/tb'
import { useFacebookAccountData } from './FacebookAccountDataManager'

const statusConfig = {
    idle: {
        label: 'Nhàn rỗi',
        color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400',
        icon: null,
    },
    running: {
        label: 'Đang chạy',
        color: 'bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-100',
        icon: <TbRefresh className="w-3 h-3" />,
    },
    pending: {
        label: 'Chờ xử lý',
        color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-100',
        icon: <TbClock className="w-3 h-3" />,
    },
    error: {
        label: 'Lỗi',
        color: 'bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-100',
        icon: <TbAlertCircle className="w-3 h-3" />,
    },
}

const FacebookAccountStatusDisplayOptimized = ({ account }) => {
    const { getAccountStatus } = useFacebookAccountData()
    const accountStatus = getAccountStatus(account.id)

    const status = accountStatus?.status || 'idle'
    const currentActivity = accountStatus?.current_activity

    const config = statusConfig[status] || statusConfig.idle

    return (
        <div className="flex items-center gap-2">
            <Badge className={`gap-1 ${config.color}`}>
                {config.icon}
                {config.label}
            </Badge>
            {currentActivity && (
                <span className="text-xs text-gray-600 dark:text-gray-400">
                    {currentActivity.task_type}
                </span>
            )}
        </div>
    )
}

export default FacebookAccountStatusDisplayOptimized

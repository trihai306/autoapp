'use client'
import React, { useState, useEffect } from 'react'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import { TbPlayerPlay, TbPlayerStop, TbRefresh, TbClock, TbCheck, TbX, TbAlertCircle } from 'react-icons/tb'
import { useFacebookAccountData } from './FacebookAccountDataManager'
import runFacebookAccountScenario from '@/server/actions/facebook-account/runFacebookAccountScenario'
import stopFacebookAccountTasks from '@/server/actions/facebook-account/stopFacebookAccountTasks'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'

const FacebookAccountStatusToggle = ({ account, onStatusChange }) => {
    const [actionLoading, setActionLoading] = useState(false)
    const { getAccountStatus, refreshData } = useFacebookAccountData()

    const status = getAccountStatus(account.id)

    const handleToggleAction = async () => {
        setActionLoading(true)
        try {
            let result
            if (status?.status === 'idle' || status?.status === 'pending') {
                // Start scenario
                result = await runFacebookAccountScenario(account.id)
            } else {
                // Stop tasks
                result = await stopFacebookAccountTasks(account.id)
            }

            if (result.success) {
                toast.push(
                    <Notification title="Thành công" type="success">
                        {result.message}
                    </Notification>
                )
                // Refresh global data after action
                await refreshData()
                if (onStatusChange) {
                    onStatusChange()
                }
            } else {
                toast.push(
                    <Notification title="Lỗi" type="danger">
                        {result.message}
                    </Notification>
                )
            }
        } catch (error) {
            toast.push(
                <Notification title="Lỗi" type="danger">
                    {error.message}
                </Notification>
            )
        } finally {
            setActionLoading(false)
        }
    }

    const getStatusConfig = (statusType) => {
        const configs = {
            idle: {
                color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400',
                label: 'Nhàn rỗi',
                icon: <TbAlertCircle className="w-3 h-3" />
            },
            pending: {
                color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
                label: 'Chờ xử lý',
                icon: <TbClock className="w-3 h-3" />
            },
            running: {
                color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
                label: 'Đang chạy',
                icon: <TbRefresh className="w-3 h-3" />
            }
        }
        return configs[statusType] || {
            color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400',
            label: 'Không xác định',
            icon: <TbAlertCircle className="w-3 h-3" />
        }
    }

    const getButtonConfig = () => {
        if (!status) return { icon: <TbRefresh className="w-4 h-4" />, variant: 'outline' }

        switch (status.status) {
            case 'idle':
            case 'pending':
                return {
                    icon: <TbPlayerPlay className="w-4 h-4" />,
                    variant: 'solid',
                    className: 'bg-green-600 hover:bg-green-700 text-white'
                }
            case 'running':
                return {
                    icon: <TbPlayerStop className="w-4 h-4" />,
                    variant: 'solid',
                    className: 'bg-red-600 hover:bg-red-700 text-white'
                }
            default:
                return { icon: <TbRefresh className="w-4 h-4" />, variant: 'outline' }
        }
    }

    const buttonConfig = getButtonConfig()

    return (
        <Button
            variant={buttonConfig.variant}
            size="sm"
            className={`p-1 ${buttonConfig.className || ''}`}
            onClick={handleToggleAction}
            loading={actionLoading}
            disabled={actionLoading}
        >
            {buttonConfig.icon}
        </Button>
    )
}

export default FacebookAccountStatusToggle

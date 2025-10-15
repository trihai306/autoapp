'use client'
import React, { useState, useEffect } from 'react'
import DataTable from '@/components/shared/DataTable'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { TbRefresh, TbClock, TbCheck, TbX, TbAlertCircle } from 'react-icons/tb'
import getFacebookAccountTasks from '@/server/actions/facebook-account/getFacebookAccountTasks'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'

const FacebookAccountTasksTable = ({ accountId, accountUsername }) => {
    const [tasks, setTasks] = useState([])
    const [loading, setLoading] = useState(true)
    const [pagination, setPagination] = useState({
        page: 1,
        per_page: 10,
        total: 0
    })

    const loadTasks = async (page = 1) => {
        setLoading(true)
        try {
            const result = await getFacebookAccountTasks(accountId, {
                page,
                per_page: pagination.per_page
            })

            if (result.success) {
                setTasks(result.data?.data || [])
                setPagination({
                    page: result.data?.current_page || 1,
                    per_page: result.data?.per_page || 10,
                    total: result.data?.total || 0
                })
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
            setLoading(false)
        }
    }

    useEffect(() => {
        if (accountId) {
            loadTasks()
        }
    }, [accountId])

    const handlePaginationChange = (nextPage) => {
        loadTasks(nextPage)
    }

    const handleRefresh = () => {
        loadTasks(pagination.page)
    }

    const getStatusConfig = (status) => {
        const configs = {
            pending: {
                color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
                label: 'Chờ xử lý',
                icon: <TbClock className="w-3 h-3" />
            },
            running: {
                color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
                label: 'Đang chạy',
                icon: <TbRefresh className="w-3 h-3" />
            },
            completed: {
                color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
                label: 'Hoàn thành',
                icon: <TbCheck className="w-3 h-3" />
            },
            failed: {
                color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
                label: 'Thất bại',
                icon: <TbX className="w-3 h-3" />
            },
            cancelled: {
                color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400',
                label: 'Đã hủy',
                icon: <TbAlertCircle className="w-3 h-3" />
            }
        }
        return configs[status] || {
            color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400',
            label: status || 'Không xác định',
            icon: <TbAlertCircle className="w-3 h-3" />
        }
    }

    const getPriorityConfig = (priority) => {
        const configs = {
            low: {
                color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400',
                label: 'Thấp'
            },
            medium: {
                color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
                label: 'Trung bình'
            },
            high: {
                color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
                label: 'Cao'
            },
            urgent: {
                color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
                label: 'Khẩn cấp'
            }
        }
        return configs[priority] || {
            color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400',
            label: priority || 'Không xác định'
        }
    }

    const columns = React.useMemo(() => [
        {
            header: 'Loại Task',
            accessorKey: 'task_type',
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {row.original.task_type}
                    </span>
                </div>
            ),
        },
        {
            header: 'Kịch bản',
            accessorKey: 'interaction_scenario',
            cell: ({ row }) => (
                <div className="text-sm text-gray-700 dark:text-gray-300">
                    {row.original.interaction_scenario?.name || '-'}
                </div>
            ),
        },
        {
            header: 'Trạng thái',
            accessorKey: 'status',
            cell: ({ row }) => {
                const config = getStatusConfig(row.original.status)
                return (
                    <Badge className={`${config.color} flex items-center gap-1`}>
                        {config.icon}
                        {config.label}
                    </Badge>
                )
            },
        },
        {
            header: 'Độ ưu tiên',
            accessorKey: 'priority',
            cell: ({ row }) => {
                const config = getPriorityConfig(row.original.priority)
                return (
                    <Badge className={config.color}>
                        {config.label}
                    </Badge>
                )
            },
        },
        {
            header: 'Thiết bị',
            accessorKey: 'device',
            cell: ({ row }) => (
                <div className="text-sm text-gray-700 dark:text-gray-300">
                    {row.original.device?.name || '-'}
                </div>
            ),
        },
        {
            header: 'Thời gian tạo',
            accessorKey: 'created_at',
            cell: ({ row }) => (
                <div className="text-sm text-gray-700 dark:text-gray-300">
                    {row.original.created_at ? new Date(row.original.created_at).toLocaleString('vi-VN') : '-'}
                </div>
            ),
        },
        {
            header: 'Bắt đầu',
            accessorKey: 'started_at',
            cell: ({ row }) => (
                <div className="text-sm text-gray-700 dark:text-gray-300">
                    {row.original.started_at ? new Date(row.original.started_at).toLocaleString('vi-VN') : '-'}
                </div>
            ),
        },
        {
            header: 'Hoàn thành',
            accessorKey: 'completed_at',
            cell: ({ row }) => (
                <div className="text-sm text-gray-700 dark:text-gray-300">
                    {row.original.completed_at ? new Date(row.original.completed_at).toLocaleString('vi-VN') : '-'}
                </div>
            ),
        },
        {
            header: 'Lỗi',
            accessorKey: 'error_message',
            cell: ({ row }) => (
                <div className="text-sm text-red-600 dark:text-red-400 max-w-xs truncate">
                    {row.original.error_message || '-'}
                </div>
            ),
        },
    ], [])

    if (!accountId) {
        return (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                Chọn tài khoản để xem tasks
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Tasks của tài khoản: {accountUsername}
                </h3>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRefresh}
                    loading={loading}
                    className="flex items-center gap-2"
                >
                    <TbRefresh className="w-4 h-4" />
                    Làm mới
                </Button>
            </div>

            <DataTable
                columns={columns}
                data={tasks}
                pagingData={{
                    pageIndex: pagination.page,
                    pageSize: pagination.per_page,
                    total: pagination.total
                }}
                onPaginationChange={handlePaginationChange}
                noData={tasks.length === 0}
                className="min-w-full"
                loading={loading}
            />
        </div>
    )
}

export default FacebookAccountTasksTable

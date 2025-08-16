'use client'
import { useMemo, useState } from 'react'
import Avatar from '@/components/ui/Avatar'
import Tag from '@/components/ui/Tag'
import DataTable from '@/components/shared/DataTable'
import { useAccountTaskListStore } from '../_store/accountTaskListStore'
import useAppendQueryParams from '@/utils/hooks/useAppendQueryParams'
import { useRouter } from 'next/navigation'
import AccountTaskListTableTools from './AccountTaskListTableTools'
import AccountTaskDetailModal from './AccountTaskDetailModal'
import dayjs from 'dayjs'
import { useTranslations } from 'next-intl'
import cloneDeep from 'lodash/cloneDeep'
import { HiOutlineEye as Eye, HiOutlineTrash as Trash } from 'react-icons/hi'
import { apiDeleteAccountTask } from '@/services/accountTask/AccountTaskService'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'

const taskStatusColor = {
    pending: 'bg-yellow-200 dark:bg-yellow-200 text-gray-900 dark:text-gray-900',
    running: 'bg-blue-200 dark:bg-blue-200 text-gray-900 dark:text-gray-900',
    completed: 'bg-emerald-200 dark:bg-emerald-200 text-gray-900 dark:text-gray-900',
    failed: 'bg-rose-200 dark:bg-rose-200 text-gray-900 dark:text-gray-900',
}

const priorityColor = {
    low: 'bg-gray-200 dark:bg-gray-200 text-gray-900 dark:text-gray-900',
    medium: 'bg-amber-200 dark:bg-amber-200 text-gray-900 dark:text-gray-900',
    high: 'bg-red-200 dark:bg-red-200 text-gray-900 dark:text-gray-900',
}

const AccountTaskListTable = ({
    accountTaskListTotal,
    page = 1,
    per_page = 10,
}) => {
    const accountTaskList = useAccountTaskListStore((state) => state.accountTaskList)
    const selectedTasks = useAccountTaskListStore((state) => state.selectedTasks)
    const isInitialLoading = useAccountTaskListStore((state) => state.initialLoading)
    const setSelectedTasks = useAccountTaskListStore((state) => state.setSelectedTasks)
    const setSelectAllTasks = useAccountTaskListStore((state) => state.setSelectAllTasks)
    const t = useTranslations('accountTaskManagement.table')
    
    const router = useRouter()
    const [selectedTask, setSelectedTask] = useState(null)
    const [showDetailModal, setShowDetailModal] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)

    const { onAppendQueryParams } = useAppendQueryParams()

    const columns = useMemo(
        () => [
            {
                header: t('taskId'),
                accessorKey: 'id',
            },
            {
                header: t('tiktokAccount'),
                accessorKey: 'tiktok_account.nickname',
                cell: (props) => {
                    const row = props.row.original
                    return (
                        <div className="flex items-center">
                            <Avatar size={28} shape="circle" src={row.tiktok_account?.avatar_url} />
                            <span className="ml-2 rtl:mr-2 font-semibold">
                                {row.tiktok_account?.nickname}
                            </span>
                        </div>
                    )
                },
            },
            {
                header: t('type'),
                accessorKey: 'task_type',
            },
            {
                header: t('status'),
                accessorKey: 'status',
                cell: (props) => {
                    const { status } = props.row.original
                    return (
                        <div className="flex items-center">
                            <Tag className={taskStatusColor[status]}>
                                <span className="capitalize">{status}</span>
                            </Tag>
                        </div>
                    )
                },
            },
            {
                header: t('priority'),
                accessorKey: 'priority',
                cell: (props) => {
                    const { priority } = props.row.original
                    return (
                        <div className="flex items-center">
                            <Tag className={priorityColor[priority]}>
                                <span className="capitalize">{priority}</span>
                            </Tag>
                        </div>
                    )
                },
            },
            {
                header: t('scheduledAt'),
                accessorKey: 'scheduled_at',
                cell: (props) => {
                    return <span>{dayjs(props.row.original.scheduled_at).format('DD/MM/YYYY HH:mm')}</span>
                },
            },
            {
                header: t('actions'),
                accessorKey: 'actions',
                cell: (props) => {
                    const row = props.row.original
                    return (
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => {
                                    setSelectedTask(row)
                                    setShowDetailModal(true)
                                }}
                                className="text-blue-600 hover:text-blue-700 p-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                title="Xem chi tiết"
                            >
                                <Eye className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => handleDeleteTask(row.id)}
                                className="text-red-600 hover:text-red-700 p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20"
                                title="Xóa task"
                            >
                                <Trash className="w-4 h-4" />
                            </button>
                        </div>
                    )
                },
            },
        ],
        [t],
    )

    const handlePaginationChange = (page) => {
        onAppendQueryParams({
            page: String(page),
        })
    }

    const handleSelectChange = (value) => {
        onAppendQueryParams({
            per_page: String(value),
            page: '1',
        })
    }

    const handleSort = (sort) => {
        onAppendQueryParams({
            sort: (sort.order === 'desc' ? '-' : '') + sort.key,
        })
    }

    const handleRowSelect = (checked, row) => {
        setSelectedTasks(checked, row)
    }

    const handleAllRowSelect = (checked, rows) => {
        if (checked) {
            const originalRows = rows.map((row) => row.original)
            setSelectAllTasks(originalRows)
        } else {
            setSelectAllTasks([])
        }
    }

    const handleDeleteTask = async (taskId) => {
        if (confirm('Bạn có chắc chắn muốn xóa task này?')) {
            setIsDeleting(true)
            try {
                const result = await apiDeleteAccountTask(taskId)
                if (result.success !== false) {
                    toast.push(
                        <Notification title="Thành công" type="success" closable>
                            Đã xóa task thành công
                        </Notification>
                    )
                    // Refresh lại danh sách
                    router.refresh()
                } else {
                    throw new Error(result.message || 'Lỗi khi xóa task')
                }
            } catch (error) {
                console.error('Error deleting task:', error)
                toast.push(
                    <Notification title="Lỗi" type="danger" closable>
                        {error.message || 'Có lỗi xảy ra khi xóa task'}
                    </Notification>
                )
            } finally {
                setIsDeleting(false)
            }
        }
    }

    return (
        <div>
            <AccountTaskListTableTools />
            <DataTable
                selectable
                columns={columns}
                data={accountTaskList}
                noData={accountTaskList.length === 0}
                skeletonAvatarColumns={[1]}
                skeletonAvatarProps={{ width: 28, height: 28 }}
                loading={isInitialLoading}
                pagingData={{
                    total: accountTaskListTotal,
                    pageIndex: page,
                    pageSize: per_page,
                }}
                checkboxChecked={(row) =>
                    selectedTasks.some((selected) => selected.id === row.id)
                }
                onPaginationChange={handlePaginationChange}
                onSelectChange={handleSelectChange}
                onSort={handleSort}
                onCheckBoxChange={handleRowSelect}
                onIndeterminateCheckBoxChange={handleAllRowSelect}
            />
            
            {/* Detail Modal */}
            <AccountTaskDetailModal
                isOpen={showDetailModal}
                onClose={() => {
                    setShowDetailModal(false)
                    setSelectedTask(null)
                }}
                task={selectedTask}
            />
        </div>
    )
}

export default AccountTaskListTable

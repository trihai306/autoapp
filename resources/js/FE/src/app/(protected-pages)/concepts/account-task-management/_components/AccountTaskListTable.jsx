'use client'
import { useMemo, useState } from 'react'
import Avatar from '@/components/ui/Avatar'
import Tag from '@/components/ui/Tag'
import DataTable from '@/components/shared/DataTable'
import { useAccountTaskListStore } from '../_store/accountTaskListStore'
import useAppendQueryParams from '@/utils/hooks/useAppendQueryParams'
import { useRouter } from 'next/navigation'
import AccountTaskListTableTools from './AccountTaskListTableTools'
import dayjs from 'dayjs'
import { useTranslations } from 'next-intl'
import cloneDeep from 'lodash/cloneDeep'

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
                    // Actions like view details, retry, etc. can be added here
                    return null
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
        </div>
    )
}

export default AccountTaskListTable
